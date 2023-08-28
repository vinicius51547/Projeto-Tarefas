import Head from 'next/head';
import { Inter } from 'next/font/google';
import styles from '@/styles/home.module.css';
import Image from 'next/image';
import { db } from '@/services/firebaseConnection';
import { collection, getDocs } from 'firebase/firestore';
import { GetStaticProps } from 'next/types';
import heroImg from '../../public/img/hero.png';

interface HomeProps {
  posts: number;
  comments: number;
}

export default function Home({ posts ,comments}: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>App | Tarefas</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            alt='Logo Tarefas'
            src={heroImg}
            priority
          />
        </div>
        <h1 className={styles.title}>
          Sistemas feito para você organizar <br />
          seus estudos e tarefas
        </h1>

        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>+{posts} posts</span>
          </section>
          <section className={styles.box}>
            <span>+{comments} comentarios</span>
          </section>
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
