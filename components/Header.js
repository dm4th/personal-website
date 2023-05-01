import React, { useState } from 'react';
import Date from '@/components/date';
import styles from '@/styles/Header.module.css';
import utilStyles from '@/styles/utils.module.css';
import loginRoles from '@/lib/loginRoles';
import { getSortedPostsData } from '@/lib/promptingBlogs';
import { useSupaUser } from '@/lib/SupaContextProvider';

export async function getStaticProps() {
    const allPostsData = await getSortedPostsData();
    return {
        props: {
            allPostsData,
        },
    };
}

const Header = ({ allPostsData, onLogin }) => {
    const { loggedInRole, supabaseClient } = useSupaUser();

    const [showDropdown, setShowDropdown] = useState(null);

    const toggleDropdown = (dropdown) => {
        if (showDropdown === dropdown) {
            setShowDropdown(null);
        } else {
            setShowDropdown(dropdown);
        }
    };
    const Dropdown = ({ title, children }) => (
        <div className={styles.dropdown}>
            <button className={styles.dropbtn} onClick={() => toggleDropdown(title)}>
                {title}
            </button>
            {showDropdown === title && (
                <div className={styles.dropdownContent}>{children}</div>
            )}
        </div>
    );

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <Dropdown title="About Me">
                    <a href="#">Submenu 1</a>
                    <a href="#">Submenu 2</a>
                </Dropdown>
                <Dropdown title="AI/ML">
                    <a href="#">Submenu 1</a>
                    <a href="#">Submenu 2</a>
                </Dropdown>
                <Dropdown title="Web3">
                    <a href="#">Submenu 1</a>
                    <a href="#">Submenu 2</a>
                </Dropdown>
                <Dropdown title="Trackers">
                    <a href="#">Submenu 1</a>
                    <a href="#">Submenu 2</a>
                </Dropdown>
                <Dropdown title="Prompting">
                    {allPostsData.map(({ id, date, title }) => (
                        <a key={`prompting-${id}`} href={`/prompting/${id}`}>
                            {title}
                            <br />
                            <small className={utilStyles.lightText}><Date dateString={date} /></small>
                        </a>
                    ))}
                </Dropdown>
            </div>
            <div className={styles.right}>
                {loggedInRole ? (
                    <button className={styles.loginStatus} onClick={() => supabaseClient.auth.signOut()}>
                        Logged in as: {loggedInRole.charAt(0).toUpperCase() + loggedInRole.slice(1)}
                    </button>
                ) : (
                    <Dropdown title="Login">
                        {loginRoles.all_but_admin.map((role) => (
                            <a key={role} href="#" onClick={() => onLogin(role)}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                            </a>
                        ))}
                    </Dropdown>
                )}
            </div>
        </header>
    );
};

export default Header;
