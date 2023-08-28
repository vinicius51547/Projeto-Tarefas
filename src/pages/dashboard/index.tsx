import { GetServerSideProps } from 'next';
import { ChangeEvent, FormEvent, useState, useEffect } from 'react';
import styles from './styles.module.css';
import Head from 'next/head';
import { getSession } from 'next-auth/react';
import { TextArea } from '../..//components/textarea';
import { FiShare2 } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';
import Link from 'next/link';
import { db } from '@/services/firebaseConnection';
import { addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

interface HomeProps {
    user: {
        email: string;
    }
}

interface TaskProps {
    id: string;
    created: Date;
    public: boolean;
    tarefa: string;
    user: string;
}

export default function Dashboard({ user }: HomeProps) {

    const [input, setInput] = useState('');
    const [publicTask, setPublicTask] = useState(false);
    const [task, setTask] = useState<TaskProps[]>([]);

    // Listando as tarefas do usuario
    useEffect(() => {
        async function loadTarefas() {

            const tarefasRef = collection(db, 'tarefas');
            const q = query(
                tarefasRef,
                orderBy('created', 'desc'),
                where('user', '==', user?.email)
            )

            onSnapshot(q, (snapshot) => {
                let lista = [] as TaskProps[];

                snapshot.forEach((doc) => {
                    lista.push({
                        id: doc.id,
                        tarefa: doc.data().tarefa,
                        created: doc.data().created,
                        user: doc.data().user,
                        public: doc.data().public
                    })
                })

                setTask(lista);
            });
        }

        loadTarefas();
    }, [user?.email]);


    // Verificando se o checkbox esta selecionado
    function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
        setPublicTask(event.target.checked);
    }

    // Registrando a tarefa no banco de dados e resetando o formulario após o envio
    async function handleRegisterTask(event: FormEvent) {
        event.preventDefault();

        if (input === '') return;

        try {
            await addDoc(collection(db, 'tarefas'), {
                tarefa: input,
                created: new Date(),
                user: user?.email,
                public: publicTask
            });

            setInput('');
            setPublicTask(false);

        } catch (err) {
            console.log(err);
        }
    }

    // Função para compartilhar o link da task
    async function handleShare(id: string) {
        await navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_URL}/task/${id}`
        );

        alert('Link copiado!')
    }

    // Função pra apagar task
    async function handleDeleteTask(id: string) {
        const docRef = doc(db, 'tarefas', id)
        await deleteDoc(docRef)
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Painel de tarefas</title>
            </Head>

            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>Qual sua tarefa?</h1>

                        <form onSubmit={handleRegisterTask}>
                            <TextArea
                                placeholder='Digite a sua tarefa'
                                value={input}
                                // onChange vai levar o valor pro useState
                                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
                            />
                            <div className={styles.checkboxArea}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={publicTask}
                                    onChange={handleChangePublic}
                                />
                                <label>Deixar tarefa publica?</label>
                            </div>

                            <button className={styles.button} type='submit'>
                                Registrar
                            </button>
                        </form>
                    </div>
                </section>

                {/* Tarefas */}
                <section className={styles.taskContainer}>
                    <h1>Minhas Tarefas</h1>

                    {task.length === 0 && (
                        <span>Nenhuma tarefa foi encontrado...</span>
                    )}

                    {task.map((item) => (
                        <article key={item.id} className={styles.task}>
                            {item.public && (
                                <div className={styles.tagContainer}>
                                    <label className={styles.tag}>Publico</label>

                                    {/* Botão de compartilhar */}
                                    <button className={styles.shareButton} onClick={() => handleShare(item.id)}>
                                        <FiShare2
                                            size={22}
                                            color='#3183ff'
                                        />
                                    </button>
                                </div>
                            )}

                            <div className={styles.taskContent}>
                                {item.public ? (
                                    <Link href={`/task/${item.id}`}>
                                        <p>{item.tarefa}</p>
                                    </Link>
                                ) : (
                                    <p>{item.tarefa}</p>
                                )}

                                <button className={styles.trashButton} onClick={() => handleDeleteTask(item.id)}>
                                    <FaTrash
                                        size={24}
                                        color='#ea3140'
                                    />
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req });

    if (!session?.user) {
        // Se não tem usuario vamos redirecionar para o '/'
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    return {
        props: {
            user: {
                email: session?.user.email,
            },
        },
    };
};