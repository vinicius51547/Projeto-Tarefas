import { useState } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { FaRegUserCircle, FaChevronUp } from 'react-icons/fa';
import { CiLogout } from "react-icons/ci";
import { RxDashboard } from "react-icons/rx";
import styles from './styles.module.css';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setTimeout(() => {
      setIsOpen(false);
    }, 150); // Aguarda 100 milissegundos antes de fechar os dropdowns
  };

  const { data: session, status } = useSession();

  return (
    <header className={styles.header}>
      <section className={styles.content}>
        <nav className={styles.navbar}>
          <Link href='/'>
            <h1 className={styles.logo}>
              Task
              <span>Hub</span>
            </h1>
          </Link>
        </nav>

        {/* DropDown */}
        {status === 'loading' ? (
          <></>
        ) : session ? (
          <div className={`${styles.dropdown} ${isOpen ? styles.open : ''}`}>
            <button
              className={styles.loginButtom}
              onClick={toggleDropdown}
              onBlur={closeDropdown}
            >
              <FaRegUserCircle size={20} />
              Olá {session?.user?.name}{' '}
              <FaChevronUp size={17} className={isOpen ? styles.rotate180 : ''} />
            </button>

            {isOpen && (
              <div className={styles.dropdownContent}>
                <ul>
                  <li>
                    {session?.user && (
                      <Link href='/dashboard' className={styles.painel}>
                        <RxDashboard /> Meu Painel
                      </Link>
                    )}
                  </li>
                  <li>
                    <a href='#' onClick={() => signOut()}>
                      <CiLogout color='#000'/> Sair
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <button className={styles.loginButtom} onClick={() => signIn('google')}>
            Acessar
          </button>
        )}
      </section>
    </header>
  );
}
