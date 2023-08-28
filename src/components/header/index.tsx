import styles from './styles.module.css';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

export function Header() {

    const { data: session, status } = useSession();

    return (
        <header className={styles.header}>
            <section className={styles.content}>
                <nav className={styles.navbar}>
                    <Link href='/'>
                        <h1 className={styles.logo}>
                            Tarefas
                            <span>+</span>
                        </h1>
                    </Link>

                    {/* Verificando se o usuario esta logado */}
                    {session?.user && (
                        <Link href='/dashboard' className={styles.painel}>
                            Meu Painel
                        </Link>
                    )}

                </nav>

                {status === 'loading' ? (
                    <></>
                ) : session ? (
                    <button className={styles.loginButtom} onClick={() => signOut()}>
                        Olá {session?.user?.name}
                    </button>
                ) : (
                    <button className={styles.loginButtom} onClick={() => signIn('google')}>
                        Acessar
                    </button>
                )}

            </section>
        </header>
    )
}