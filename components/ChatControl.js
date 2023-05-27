// React imports
import React, { useState, useEffect } from 'react';

// Supabase Imports
import { useSupaUser } from '@/lib/SupaContextProvider';

// Component Imports
import Avatar from '@/components/Avatar';

// Styles Imports
import styles from '@/styles/ChatControl.module.css';
import utilStyles from '@/styles/utils.module.css';

const ChatControl = ({ updateChatId }) => {
    // Bring in SupaBase context
    const { user, userDetails, chatRole, availableChatRoles, updateChatRole, supabaseClient } = useSupaUser();

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [previousChats, setPreviousChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);

    const handleSettingsToggle = () => {
        setSettingsOpen(!settingsOpen);
    };

    // Update previous chats
    useEffect(() => {
        if (user) {
            const fetchPreviousChats = async () => {
                const { data: chatsData, error: chatError } = await supabaseClient
                    .from('chats')
                    .select('id, title')
                    .eq('role_id', chatRole.id)
                    .order('created_at', { ascending: false });
                if (chatError) throw chatError;
                const chats = chatsData.map(chat => {
                    return { id: chat.id, title: chat.title };
                });
                setPreviousChats(chats);
            }
            fetchPreviousChats();
        }
    }, [chatRole]);

    // Update title and chat Id when selected chat changes
    useEffect(() => {
        if (selectedChat) {
            setTitle(selectedChat.title);
            updateChatId(selectedChat.id);
        }
    }, [selectedChat]);

    const handleChangeChatRole = (event) => {
        updateChatRole(event.target.value);
    };

    const handleChangeChat = (event) => {
        const chat = previousChats.find(chat => chat.id.toString() === event.target.value);
        setSelectedChat(chat);
    };

    const handleChangeTitle = (event) => {
        setTitle(event.target.value);
        const updateChatTitle = async (chatId, title) => {
            const { error: chatTitleError } = await supabaseClient
                .from('chats')
                .update({ title })
                .eq('id', chatId);
            if (chatTitleError) throw chatTitleError;
        };
        updateChatTitle(selectedChat.id, title);
    };

    // Only render when a user is logged in
    if (!userDetails || !chatRole) return (
        <div className={styles.chatControlTitle}>
            <h2 className={utilStyles.headingLg}>Chat with Me</h2>
        </div>
    );

    return (
        <div>
            <div className={styles.chatControlTitle}>
                <h2 className={utilStyles.headingLg}>Chat with Me</h2>
                <button className={styles.settingsButton} onClick={handleSettingsToggle}>Settings</button>
            </div>
            {settingsOpen &&
                <div  className={styles.chatControlWrapper}>
                    <div className={`${styles.controlsRow} ${!userDetails.avatar_url && styles.noAvatar}`}>
                        <Avatar url={userDetails.avatar_url} avatarClass={styles.avatar} noAvatarClass={styles.noAvatar} />
                        <div className={styles.roleControl}>
                            <label className={styles.chatLabel}>Chat Role:</label>
                            <select className={styles.inputBox} value={chatRole} onChange={handleChangeChatRole}>
                                {availableChatRoles.map(role =>
                                    <option key={role.id} value={role.role}>{role.role}</option>
                                )}
                            </select>
                        </div>
                        <div className={styles.chatControl}>
                            <label className={styles.chatLabel}>Previous Chats:</label>
                            <select className={styles.inputBox} value={selectedChat?.id || ''} onChange={handleChangeChat}>
                                <option value="">--Select a chat--</option>
                                {previousChats.map(chat =>
                                    <option key={chat.id} value={chat.id}>{chat.title}</option>
                                )}
                            </select>
                        </div>
                    </div>
                    <div className={styles.titleRow}>
                        <label className={styles.accountInfoLabel}>Title:</label>
                        <input className={`${styles.inputBox} ${styles.inputBoxWithTitle}`} type="text" value={title} onChange={handleChangeTitle} />
                        <div className={styles.submitButtonWrapper}>
                            <button className={styles.updateButton}>Update</button>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};

export default ChatControl;
