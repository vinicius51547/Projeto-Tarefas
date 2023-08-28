import { ChangeEvent, FormEvent, useState } from 'react';
import { useSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import styles from './styles.module.css';
import { db } from '@/services/firebaseConnection';
import { FaTrash } from 'react-icons/fa';
import { doc, collection, query, where, getDoc, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { TextArea } from '@/components/textarea';

interface TaskProps {
    item: {
        tarefa: string;
        created: string;
        public: boolean;
        user: string;
        taskId: string;
    };
    allComments: CommentProps[];
}

interface CommentProps {
    id: string;
    comment: string;
    taskId: string;
    user: string;
    name: string;
}

export default function Task({ item, allComments }: TaskProps) {
    const { data: session } = useSession();

    const [input, setInput] = useState("");
    const [comments, setComments] = useState<CommentProps[]>(allComments || []);

    async function handleComment(event: FormEvent) {
        event.preventDefault();

        if (input === "") return;

        if (!session?.user?.email || !session?.user?.name) return;

        try {
            const docRef = await addDoc(collection(db, "comments"), {
                comment: input,
                created: new Date(),
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId,
            });

            const data = {
                id: docRef.id,
                comment: input,
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId,
            };

            setComments((oldItens) => [...oldItens, data]);

            setInput("");
        } catch (err) {
            console.log(err);
        }
    }

    // Função para deletar comentário
    async function handleDeleteComment(id: string) {
        try {
            const docRef = doc(db, 'comments', id)
            await deleteDoc(docRef);

            const deleteComment = comments.filter((item) => item.id !== id);

            setComments(deleteComment);

            alert('Comentário deletado');
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className={styles.container}>

            <main className={styles.main}>
                <h1>Tarefa</h1>
                <article className={styles.task}>
                    <p>{item.tarefa}</p>
                </article>
            </main>

            <section className={styles.commentsContainer}>
                <h2>Deixar comentário</h2>

                <form onSubmit={handleComment}>
                    <TextArea
                        value={input}
                        onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                            setInput(event.target.value)
                        }
                        placeholder="Digite seu comentário..."
                    />
                    <button disabled={!session?.user} className={styles.button}>
                        Enviar comentário
                    </button>
                </form>
            </section>

            <section className={styles.commentsContainer}>
                <h2>Todos comentários</h2>
                {comments.length === 0 && (
                    <span>Nenhum comentário foi encontrado...</span>
                )}

                {comments.map((item) => (
                    <article key={item.id} className={styles.comment}>

                        <div className={styles.headComment}>
                            <label className={styles.commentsLabel}>{item.name}</label>
                            {item.user === session?.user?.email && (
                                <button className={styles.buttonTrash} onClick={() => handleDeleteComment(item.id)}>
                                    <FaTrash
                                        size={18}
                                        color='#ea3140'
                                    />
                                </button>
                            )}
                        </div>
                        <p>{item.comment}</p>
                    </article>
                ))}
            </section>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const id = params?.id as string;
    const docRef = doc(db, "tarefas", id);

    const q = query(collection(db, "comments"), where("taskId", "==", id));
    const snapshotComments = await getDocs(q);

    let allComments: CommentProps[] = [];
    snapshotComments.forEach((doc) => {
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            user: doc.data().user,
            name: doc.data().name,
            taskId: doc.data().taskId,
        });
    });

    const snapshot = await getDoc(docRef);

    if (snapshot.data() === undefined) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    if (!snapshot.data()?.public) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    const miliseconds = snapshot.data()?.created?.seconds * 1000;

    const task = {
        tarefa: snapshot.data()?.tarefa,
        public: snapshot.data()?.public,
        created: new Date(miliseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
        taskId: id,
    };

    return {
        props: {
            item: task,
            allComments: JSON.parse(JSON.stringify(allComments)),
        },
    };
};
