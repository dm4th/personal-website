// Supabase Imports
import { useSupaUser } from '@/lib/SupaContextProvider';

// Component Imports
import Avatar from '@/components/Avatar';
import SourceReferences from '@/components/SourceReferences';
import LlmGuessGame from '@/components/LlmGuessGame';

// Styles Imports
import styles from '@/styles/ChatHistory.module.css';
import utilStyles from '@/styles/utils.module.css';

const ChatHistory = ({ messages, latestUserMessage, latestResponse, latestSources, selectedModel }) => {
    const { userDetails } = useSupaUser();
    
    // Debug logging of props
    console.log("ChatHistory received props:", { 
        messageCount: messages?.length || 0,
        latestUserMessage: latestUserMessage ? `${latestUserMessage.substring(0, 20)}...` : 'none',
        latestResponseLength: latestResponse?.length || 0,
        latestSourcesCount: latestSources?.length || 0,
        selectedModel
    });

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

    // Get model image based on model name
    const getModelImage = (model) => {
        switch(model) {
            case 'gpt-4':
                return '/icons/gpt-model.png';
            case 'claude-3':
                return '/icons/claude-model.png';
            case 'llama-3':
                return '/icons/llama-model.png';
            default:
                return '/icons/bot.png';
        }
    };

    const botMessageDisp = (response, key, sources, modelName = null) => {
        // Get appropriate image based on selected model
        const imgSrc = modelName ? getModelImage(modelName) : '/icons/bot.png';
        
        console.log(`botMessageDisp: Called with response length ${response?.length || 0}, model ${modelName || 'default'}`);
        
        if (response && response.length > 0) {
            console.log(`botMessageDisp: Displaying response message (first 50 chars): "${response.substring(0, 50)}..."`);
            return (
                <div className={`${styles.convoDiv} ${styles.respDiv}`}>
                    <img src={imgSrc} alt={modelName || 'bot'} className={styles.convoImg} />
                    <div className={styles.convoRespContainer}>
                        {modelName && <div className={styles.modelLabel} style={{ fontWeight: 'bold', marginBottom: '5px' }}>{modelName}</div>}
                        <div key={key} className={styles.convoRespText} dangerouslySetInnerHTML={{__html: response}}></div>
                        {sources && <SourceReferences sources={sources} />}
                    </div>
                </div>
            )
        } else {
            console.log(`botMessageDisp: No response yet, showing loading indicator`);
            return (
                <div className={`${styles.convoDiv} ${styles.respDiv}`}>
                    <img src={imgSrc} alt={modelName || 'bot'} className={styles.convoImg} />
                    <div key={key} className={styles.convoRespWait} >
                        <img src='/icons/magnifying-glass.png' alt='thinking' />
                    </div>
                </div>
            );
        }
    }

    const latestMessageDisp = () => {
        if (latestUserMessage === '') {
            console.log("latestMessageDisp: No user message, returning null");
            return null;
        }
        
        console.log("latestMessageDisp: Displaying message with response length:", latestResponse?.length || 0);
        
        // In development, we might have sources stored in a global window variable
        // This ensures we don't lose sources between state updates
        const sourcesToUse = latestSources && latestSources.length > 0 
            ? latestSources 
            : (typeof window !== 'undefined' && window.lastSources ? window.lastSources : []);
        
        return (
            <div className={styles.convoBlock}>
                {userMessageDisp(latestUserMessage, 'u')}
                {botMessageDisp(latestResponse, 'm', sourcesToUse, selectedModel)}
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
                    {message.multiLlm ? (
                        // For multi-LLM messages from history, display a read-only version of the game
                        <div className={styles.historyGameResult}>
                            <div style={{ marginBottom: '15px', fontStyle: 'italic', fontSize: '14px' }}>
                                Guessing game result:
                            </div>
                            <LlmGuessGame
                                llmResponses={message.models}
                                onGuess={() => {}} // No-op since this is read-only history
                                currentGuessIndex={message.models.findIndex(m => m.model === message.guessedModel)}
                            />
                        </div>
                    ) : (
                        // Regular message - if it has a stored modelName property use it, otherwise use selectedModel
                        botMessageDisp(
                            message.model.text, 
                            `m-${index}`, 
                            message.model.sources,
                            message.model.modelName || (message.selectedModel ? message.selectedModel : selectedModel)
                        )
                    )}
                </div>
            ))}
        </div>
    );
};

export default ChatHistory;
