// Supabase Imports
import { useSupaUser } from '@/lib/SupaContextProvider';

// Component Imports
import Avatar from '@/components/Avatar';
import SourceReferences from '@/components/SourceReferences';

// Styles Imports
import styles from '@/styles/ChatHistory.module.css';
import utilStyles from '@/styles/utils.module.css';

const ChatHistory = ({ messages, latestUserMessage, latestResponse, latestSources }) => {
    const { userDetails } = useSupaUser();

    const userAvatarDisp = () => {
        if (userDetails && userDetails.avatar_url) {
            return (
                <Avatar url={userDetails.avatar_url} avatarClass={styles.convoImg} noAvatarClass={styles.convoImg} />
            );
        } else {
            return (
                <img src='/icons/user.png' alt='user' className={styles.convoImg} />
            );
        }
    }

    const userMessageDisp = (message, key) => {
        return (
            <div className={`${styles.convoDiv} ${styles.promptDiv}`}>
                {userAvatarDisp()}
                <div key={key} className={styles.convoPromptText}>
                    {message}
                </div>
            </div>
        );
    }

    const botMessageDisp = (response, key, sources) => {
        if (response.length > 0) {
            return (
                <div className={`${styles.convoDiv} ${styles.respDiv}`}>
                    <img src='/icons/bot.png' alt='bot' className={styles.convoImg} />
                    <div className={styles.convoRespContainer}>
                        <div key={key} className={styles.convoRespText} dangerouslySetInnerHTML={{__html: response}}></div>
                        {sources && <SourceReferences sources={sources} />}
                    </div>
                </div>
            )
        } else {
            return (
                <div className={`${styles.convoDiv} ${styles.respDiv}`}>
                    <img src='/icons/bot.png' alt='bot' className={styles.convoImg} />
                    <div key={key} className={styles.convoRespWait} >
                        <img src='/icons/magnifying-glass.png' alt='thinking' />
                    </div>
                </div>
            );
        }
    }

    const latestMessageDisp = () => {
        if (latestUserMessage === '') return null;
        
        // In development, we might have sources stored in a global window variable
        // This ensures we don't lose sources between state updates
        const sourcesToUse = latestSources && latestSources.length > 0 
            ? latestSources 
            : (typeof window !== 'undefined' && window.lastSources ? window.lastSources : []);
        
        return (
            <div className={styles.convoBlock}>
                {userMessageDisp(latestUserMessage, 'u')}
                {botMessageDisp(latestResponse, 'm', sourcesToUse)}
            </div>
        );
    }

    // if (messages.length === 0) and latestUserMessage is an empty string return null;
    if (messages.length === 0 && latestUserMessage === '') return null;

    return (
        <div className={styles.convoHistoryContainer}>
            <h2 className={utilStyles.headingLg}>Chat History</h2>
            {latestMessageDisp()}
            {messages.slice().reverse().map((message, index) => (
                <div key={`c-${index}`} className={styles.convoBlock}>
                    {userMessageDisp(message.user.text, `u-${index}`)}
                    {botMessageDisp(message.model.text, `m-${index}`, message.model.sources)}
                </div>
            ))}
        </div>
    );
};

export default ChatHistory;
