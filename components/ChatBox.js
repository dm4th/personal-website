import React, { useState, useRef, useEffect } from 'react';
import styles from '@/styles/ChatBox.module.css';

const ChatBox = ({ onUserInput }) => {
    const [userInput, setUserInput] = useState('');
    const textareaRef = useRef(null);

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleUserInput(event);
        } else {
            resizeTextarea();
        }
    };

    const handleChange = (event) => {
        setUserInput(event.target.value);
        resizeTextarea();
    };

    const resizeTextarea = () => {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    };

    const handleUserInput = async (event) => {
        event.preventDefault();
        onUserInput(userInput);
        setUserInput('');
        textareaRef.current.style.height = 'auto';
    };

    useEffect(() => {
        resizeTextarea();
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <form onSubmit={handleUserInput} className={styles.formStyle}>
                    <textarea
                        ref={textareaRef}
                        className={styles.textArea}
                        value={userInput}
                        onKeyDown={handleKeyDown}
                        onChange={handleChange}
                        placeholder="..."
                        rows="1"
                        style={{ whiteSpace: 'pre-wrap' }}
                    />
                    <button type="submit" className={styles.btn}>
                        <img src='/icons/upload_circle.png' alt='send' className={styles.icon} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatBox;
