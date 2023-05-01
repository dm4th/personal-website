import React, { useState } from 'react';
import styles from '@/styles/Header.module.css';
import loginRoles from '@/lib/loginRoles';

const Header = ({ onLogin, loggedInRole, onLogout }) => {
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
                    <a href="#">Submenu 1</a>
                    <a href="#">Submenu 2</a>
                </Dropdown>
            </div>
            <div className={styles.right}>
                {loggedInRole ? (
                    <button className={styles.loginStatus} onClick={onLogout}>
                        Logged in as: {loggedInRole}
                    </button>
                ) : (
                    <Dropdown title="Login">
                        {loginRoles.all_but_admin.map((role) => (
                            <a href="#" onClick={() => onLogin(role)}>
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
