// React imports
import React, { useState, useEffect } from 'react';

// Supabase Imports
import { useSupaUser } from '@/lib/SupaContextProvider';

// Component Imports
import Avatar from '@/components/Avatar';

// Styles Imports
import styles from '@/styles/ChatControl.module.css';
import utilStyles from '@/styles/utils.module.css';

const ChatControl = ({ }) => {
    // Bring in SupaBase context
    const { 
        userDetails, 
        chatRole, 
        availableChatRoles, 
        previousChats, 
        chat, 
        updateChatRole, 
        changeChat,
        writeChatTitle
    } = useSupaUser();

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [localChatTitle, setLocalChatTitle] = useState('');

    const handleSettingsToggle = () => {
        setSettingsOpen(!settingsOpen);
    };

    const handleChangeChatRole = async (event) => {
        await updateChatRole(event.target.value);
        setLocalChatTitle('');
    };

    const handleChangeChat = (event) => {
        changeChat(event.target.value);
    };

    const handleChangeTitle = (event) => {
        setLocalChatTitle(event.target.value);
    };

    const handleWriteTitle = async () => {
        await writeChatTitle(localChatTitle);
    };

    const renderChatOptions = () => {
        if (previousChats.length === 0) return (
            <div className={styles.chatControl}>
                <label className={styles.chatLabel}>No Available Chats</label>
            </div>
        );
        return (
            <div className={styles.chatControl}>
                <label className={styles.chatLabel}>Previous Chats:</label>
                <select className={styles.inputBox} value={chat ? chat.id : ''} onChange={handleChangeChat}>
                    {previousChats.map(chat =>
                        <option key={chat.id} value={chat.id}>{chat.title}</option>
                    )}
                    {/* Add option to create new chat */}
                    <option key='new' value=''>Create New Chat</option>
                </select>
            </div>
        );
    };

    const renderTitle = () => {
        if (chat) return (
            <div className={styles.titleRow}>
                <label className={styles.accountInfoLabel}>Title:</label>
                <input className={`${styles.inputBox} ${styles.inputBoxWithTitle}`} type="text" value={localChatTitle} onChange={handleChangeTitle} />
                <div className={styles.submitButtonWrapper}>
                    <button className={styles.updateButton} onClick={handleWriteTitle}>Update</button>
                </div>
            </div>
        );
    };


    useEffect(() => {
        if (chat) setLocalChatTitle(chat.title);
        else setLocalChatTitle('');
    }, [chat]);

    // Only render when a user is logged in
    if (!userDetails || !chatRole) return (
        <div className={styles.chatControlTitle}>
            <h2 className={utilStyles.headingLg}>Chat</h2>
        </div>
    );

    return (
        <div>
            <div className={styles.chatControlTitle}>
                <h2 className={utilStyles.headingLg}>Chat</h2>
                <button className={styles.settingsButton} onClick={handleSettingsToggle}>Settings</button>
            </div>
            {settingsOpen &&
                <div  className={styles.chatControlWrapper}>
                    <div className={`${styles.controlsRow} ${!userDetails.avatar_url && styles.noAvatar}`}>
                        <Avatar url={userDetails.avatar_url} avatarClass={styles.avatar} noAvatarClass={styles.noAvatar} />
                        <div className={styles.roleControl}>
                            <label className={styles.chatLabel}>Chat Role:</label>
                            <select className={styles.inputBox} value={chatRole.role} onChange={handleChangeChatRole}>
                                {availableChatRoles.map(role =>
                                    <option key={role.id} value={role.role}>{role.role[0].toUpperCase() + role.role.slice(1)}</option>
                                )}
                            </select>
                        </div>
                        {renderChatOptions()}
                    </div>
                    {renderTitle()}
                </div>
            }
        </div>
    );
};

export default ChatControl;
