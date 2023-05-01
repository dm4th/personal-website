import React from 'react';

import loginRoles from '@/lib/loginRoles';
import utilStyles from '@/styles/utils.module.css';

const LoginButton = ({ role, onClick }) => (
    <button className={utilStyles.loginButton} onClick={() => onClick(role)}>
        {role === 'intro' ? 'Continue Without Login' : `Log in as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
    </button>
);

const LoginButtons = ({ onLogin }) => {
    const handleLogin = (role) => {
        onLogin(role);
    };

  return (
    <div>
        {loginRoles.all_but_admin.map((role) => (
            <LoginButton role={role} onClick={handleLogin} />
        ))}
    </div>
  );
};

export default LoginButtons;
