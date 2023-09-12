import Head from 'next/head';
import { Inter } from 'next/font/google';
import styles from '@/styles/home.module.css';
import Image from 'next/image';
import { db } from '@/services/firebaseConnection';
import { collection, getDocs } from 'firebase/firestore';
import { GetStaticProps } from 'next/types';
import heroImg from '../../public/img/hero.svg';
import { BiComment } from "react-icons/bi";
import { FiEdit } from 'react-icons/fi';

interface HomeProps {
  posts: number;
  comments: number;
}

export default function Home({ posts, comments }: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>App | TaskHub</title>
      </Head>

      <main className={styles.main}>
        <Image
          className={styles.hero}
          alt='Logo Tarefas'
          src={heroImg}
          priority
        />


        <div className={styles.infoContainer}>
          <h1 className={styles.title}>
            Sistemas feito para você organizar <br />
            seus estudos e tarefas
          </h1>
          <p className={styles.description}>
            Descubra como nossa plataforma simplifica a gestão de suas atividades acadêmicas e facilita sua jornada de aprendizado.
          </p>

          <div className={styles.infoContent}>
            <section className={styles.box}>
              <FiEdit
                size={25}
              />
              <span>+{posts} Posts</span>
            </section>
            <section className={styles.box}>
              <BiComment
                size={25}
              />
              <span>+{comments} Comentarios</span>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}


export const getStaticProps: GetStaticProps = async () => {
  const commentRef = collection(db, 'comments');
  const postRef = collection(db, 'tarefas');

  const commentSnapshot = await getDocs(commentRef);
  const postSnapshot = await getDocs(postRef);

  return {
    props: {
      posts: postSnapshot.size || 0,
      comments: commentSnapshot.size || 0
    },
    revalidate: 60, // Revalidando a cada 60 segundos
  };
};
