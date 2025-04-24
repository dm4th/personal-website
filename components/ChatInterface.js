// React imports
import React, { useState, useEffect } from 'react';

// Networking Imports
import { fetchEventSource } from '@microsoft/fetch-event-source';
import ChatBox from '@/components/ChatBox.js';
import ChatControl from '@/components/ChatControl.js';
import ChatHistory from '@/components/ChatHistory.js';

// Styles
import styles from '@/styles/ChatHistory.module.css';
import utilStyles from '@/styles/utils.module.css';

// Supabase Imports
import { useSupaUser } from '@/lib/SupaContextProvider';

// Multi-LLM feature
import LlmGuessGame from '@/components/LlmGuessGame.js';
import GuessHistory from '@/components/GuessHistory.js';

const ChatInterface = ({ }) => {
    // Get Supabase User context
    const { user, chat, chatRole, changeChat, supabaseClient } = useSupaUser();
    
    // State to keep track of all guesses in the current session
    const [allGuesses, setAllGuesses] = useState([]);

    // Function to handle user guesses about which LLM created a response
    const handleLlmGuess = (guessIndex) => {
        setCurrentGuessIndex(guessIndex);
        
        // Check if guess was correct (the model with isReal=true)
        const correctIndex = multiLlmResponses.findIndex(r => r.isReal);
        const isCorrect = guessIndex === correctIndex;
        
        // Update stats
        setGuessStats(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            incorrect: prev.incorrect + (isCorrect ? 0 : 1)
        }));
        
        // Add this guess to history
        const newGuess = {
            prompt: latestUserMessage,
            responses: multiLlmResponses,
            guessedIndex: guessIndex,
            correctIndex: correctIndex,
            isCorrect
        };
        
        setAllGuesses(prev => [newGuess, ...prev]);
        
        // Save guess result to database (in a real implementation)
        // For demo, we'll just update local state
    };

    const [initialized, setInitialized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [latestUserMessage, setLatestUserMessage] = useState('');
    const [latestResponse, setLatestResponse] = useState('');
    const [latestSources, setLatestSources] = useState([]);
    
    // LLM selection and guessing game states
    const [selectedModel, setSelectedModel] = useState('game'); // Default to game mode
    const [currentSelectedModel, setCurrentSelectedModel] = useState(null); // For specific model selection
    const [multiLlmResponses, setMultiLlmResponses] = useState([]); // Array of {model: string, response: string, sources: []}
    const [currentGuessIndex, setCurrentGuessIndex] = useState(null);
    const [guessStats, setGuessStats] = useState({ correct: 0, incorrect: 0 });
    
    // Store all model responses for the latest message
    const [modelResponses, setModelResponses] = useState({
        'default': { text: '', sources: [] },
        'gpt-4': { text: '', sources: [] },
        'claude-3': { text: '', sources: [] },
        'llama-3': { text: '', sources: [] },
    });

    // Store separate chat ID values for each model in case we want to switch models
    const [modelChatIds, setModelChatIds] = useState({
        'default': null,
        'gpt-4': null,
        'claude-3': null,
        'llama-3': null,
    });
    
    // Computed properties for mode selection
    const guessGameEnabled = selectedModel === 'game';
    const showChatHistory = !guessGameEnabled || multiLlmResponses.length === 0;

    const chatEndpoint = () => {
        switch (chatRole.role) {
            case 'intro':
                return '/chat-intro'
            case 'employer':
                return '/chat-employer' 
            default:
                return '/chat-employer';
        }
    };

    const onUserInput = async (userInput) => {
        // Reset states in preparation for new message
        if (initialized) {
            // Save the current state before resetting
            const currentResponse = latestResponse;
            const currentSources = latestSources || [];
            const currentUserMessage = latestUserMessage;
            
            // Determine what to save based on whether guess game is active
            if (guessGameEnabled && multiLlmResponses.length > 0) {
                // For guess game, save all LLM responses and user's guesses
                const guessIndex = currentGuessIndex !== null ? currentGuessIndex : Math.floor(Math.random() * multiLlmResponses.length);
                
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        multiLlm: true,
                        models: multiLlmResponses,
                        guessCorrect: true,
                        guessedModel: multiLlmResponses[guessIndex].model,
                        user: {
                            text: currentUserMessage,
                            objects: [],
                        },
                    },
                ]);
            } else {
                // Standard single-LLM response
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        model: {
                            text: currentResponse,
                            sources: currentSources,
                            objects: [],
                            modelName: window.lastModelName || (selectedModel !== 'default' ? selectedModel : null),
                        },
                        user: {
                            text: currentUserMessage,
                            objects: [],
                        },
                        selectedModel: window.lastModelName || (selectedModel !== 'default' ? selectedModel : null),
                    },
                ]);
            }
        }
        
        // Reset states for new message
        setLatestUserMessage(userInput);
        setLatestResponse('');
        setLatestSources([]);
        
        // Reset stored model responses
        setModelResponses({
            'default': { text: '', sources: [] },
            'gpt-4': { text: '', sources: [] },
            'claude-3': { text: '', sources: [] },
            'llama-3': { text: '', sources: [] },
        });
        
        // Reset multi-LLM states if game is enabled
        if (guessGameEnabled) {
            setMultiLlmResponses([]);
            setCurrentGuessIndex(null);
        }

        const functionUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
        const chatUrl = functionUrl + chatEndpoint();
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        // Define LLM models we want to get responses from
        const llmModels = ['default', 'gpt-4', 'claude-3', 'llama-3'];
        
        // Track if we've completed the response to address first query issue
        let responseComplete = false;
        let collectedResponses = {};
        let selectedModelResponse = '';
        let collectedSources = [];
        
        if (selectedModel === 'game') {
            // In game mode, make multiple API calls
            const activeModels = llmModels.slice(1); // Skip "default"
            
            // Initialize responses collection
            activeModels.forEach(model => {
                collectedResponses[model] = { 
                    text: '', 
                    sources: [],
                    complete: false
                };
            });
            
            // Randomly select which model will be the "real" one for this round
            // but we actually make calls to all models
            const realModelIndex = Math.floor(Math.random() * activeModels.length);
            const realModel = activeModels[realModelIndex];
            
            // Make multiple API calls - one for each model directly to their endpoints
            const modelRequests = activeModels.map(async (model) => {
                try {
                    // Determine the appropriate API endpoint for each model
                    let modelEndpoint;
                    switch (model) {
                        case 'gpt-4':
                            modelEndpoint = '/api/chat-gpt4';
                            break;
                        case 'claude-3':
                            modelEndpoint = '/api/chat-claude';
                            break;
                        case 'llama-3':
                            modelEndpoint = '/api/chat-llama';
                            break;
                    }
                    
                    console.log(`Calling ${model} API at ${modelEndpoint}`);
                    
                    // Create request data for this model
                    const modelPostData = JSON.stringify({
                        prompt: userInput,
                        chat_id: modelChatIds[model],
                        user_id: user?.id,
                        include_sources: true
                    });
                    
                    // Use Promise to handle each model response
                    return new Promise((resolve) => {
                        // Add slight timing variation for realism in the game
                        setTimeout(async () => {
                            await fetchEventSource(
                                modelEndpoint,
                                {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${anonKey}`,
                                        'apikey': anonKey
                                    },
                                    body: modelPostData,
                                    onmessage(event) {
                                        const data = JSON.parse(event.data);
                                        if (data.chat_id) {
                                            setModelChatIds(prev => ({
                                                ...prev,
                                                [model]: data.chat_id
                                            }));
                                        }
                                        if (data.token) {
                                            // Accumulate response for this specific model
                                            collectedResponses[model].text += data.token;
                                            
                                            // Store the response in our modelResponses state
                                            setModelResponses(prev => ({
                                                ...prev,
                                                [model]: {
                                                    ...prev[model],
                                                    text: collectedResponses[model].text
                                                }
                                            }));
                                            
                                            // If this is the randomly selected real model, also update UI
                                            if (model === realModel) {
                                                setLatestResponse(collectedResponses[model].text);
                                            }
                                        }
                                        if (data.sources) {
                                            collectedResponses[model].sources = data.sources;
                                            
                                            // Store sources in our modelResponses state
                                            setModelResponses(prev => ({
                                                ...prev,
                                                [model]: {
                                                    ...prev[model],
                                                    sources: data.sources
                                                }
                                            }));
                                            
                                            if (model === realModel) {
                                                setLatestSources(data.sources);
                                                collectedSources = data.sources;
                                            }
                                        }
                                    },
                                    onclose() {
                                        console.log(`${model} API call completed`);
                                        collectedResponses[model].complete = true;
                                        
                                        
                                        // Check if all models have completed
                                        const allComplete = Object.values(collectedResponses)
                                            .every(response => response.complete);
                                            
                                        if (allComplete && !responseComplete) {
                                            responseComplete = true;
                                            
                                            // Create the final responses array for the game
                                            const finalResponses = activeModels.map(modelName => ({
                                                model: modelName,
                                                response: collectedResponses[modelName].text,
                                                sources: collectedResponses[modelName].sources || [],
                                                isReal: modelName === realModel
                                            }));
                                            setMultiLlmResponses(finalResponses);
                                        }
                                        
                                        resolve();
                                    }
                                }
                            );
                        }, Math.random() * 1000); // Randomize timing a bit for realism
                    });
                } catch (error) {
                    console.error(`Error calling ${model} API:`, error);
                    return Promise.resolve(); // Continue with other models even if one fails
                }
            });
            
            // Wait for all model requests to complete
            await Promise.all(modelRequests);
            
        } else {
            // Single model mode - use the selected model or default
            const modelToUse = selectedModel !== 'default' ? selectedModel : 'default';
            
            // Determine which endpoint to use based on selected model
            let endpoint;
            if (modelToUse === 'default') {
                // For default, use the standard chat endpoint (intro or employer)
                endpoint = chatUrl;
            } else {
                // For specific models, use their dedicated endpoints
                switch (modelToUse) {
                    case 'gpt-4':
                        endpoint = '/api/chat-gpt4';
                        break;
                    case 'claude-3':
                        endpoint = '/api/chat-claude';
                        break;
                    case 'llama-3':
                        endpoint = '/api/chat-llama';
                        break;
                }
            }
            
            console.log(`Using model ${modelToUse} with endpoint ${endpoint}`);
            
            // Prepare request data
            const requestData = JSON.stringify({
                prompt: userInput,
                chat_id: modelChatIds[modelToUse],
                user_id: user?.id,
                include_sources: true
            });
            
            // Call the appropriate endpoint
            await fetchEventSource(
                endpoint,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${anonKey}`,
                        'apikey': anonKey
                    },
                    body: requestData,
                    onmessage(event) {
                        // Log more specifically based on the endpoint
                        const apiType = endpoint.includes('llama') ? 'Llama' : 
                                       endpoint.includes('claude') ? 'Claude' : 'GPT-4';
                        
                        // Add better error handling for JSON parsing
                        let data;
                        try {
                            data = JSON.parse(event.data);
                        } catch (parseError) {
                            console.error(`Error parsing JSON from ${apiType} API:`, parseError);
                            console.error('Raw event data that failed to parse:', event.data);
                            return; // Skip this event
                        }
                        
                        if (data.chat_id) {
                            setModelChatIds(prev => ({
                                ...prev,
                                [modelToUse]: data.chat_id
                            }));
                        }
                        if (data.token) {
                            selectedModelResponse += data.token;
                            setLatestResponse(selectedModelResponse);
                            
                            // Force an immediate UI update when token is received
                            // This can help with browsers that might be buffering state updates
                            setTimeout(() => {
                                setLatestResponse(prevResponse => prevResponse); // Re-render with same data
                            }, 0);
                            
                            // Store the response for this model
                            setModelResponses(prev => ({
                                ...prev,
                                [modelToUse]: {
                                    ...prev[modelToUse],
                                    text: selectedModelResponse
                                }
                            }));
                        }
                        if (data.sources) {
                            collectedSources = data.sources;
                            setLatestSources(collectedSources);
                            
                            // Store the sources for this model
                            setModelResponses(prev => ({
                                ...prev,
                                [modelToUse]: {
                                    ...prev[modelToUse],
                                    sources: collectedSources
                                }
                            }));
                        }
                    },
                    onclose() {
                        responseComplete = true;
                        
                        // Store the model information for saving to database
                        window.lastModelName = modelToUse;
                        console.log(`${modelToUse} API connection closed successfully`);
                    },
                    onerror(err) {
                        console.error(`Error with ${modelToUse} API connection:`, err);
                        // Try to reconnect unless the server explicitly asked to stop
                        if (err.message.includes('terminated')) {
                            return true; // Close the connection
                        }
                        return false; // Attempt to reconnect
                    },
                }
            );
        }
        
        // Backup logic in case onclose doesn't fire (which can happen in some browsers)
        setTimeout(() => {
            if (!responseComplete) {
                
                if (selectedModel === 'game' && Object.keys(collectedResponses).length > 0) {
                    // Create responses from what we have
                    const activeModels = llmModels.slice(1);
                    const realModelIndex = activeModels.findIndex(model => 
                        collectedResponses[model] && collectedResponses[model].text.length > 0);
                    
                    if (realModelIndex >= 0) {
                        const realModel = activeModels[realModelIndex];
                        
                        // Create simulated responses for all models
                        const simulatedResponses = activeModels.map(model => {
                            return {
                                model,
                                response: collectedResponses[model]?.text || "Response unavailable",
                                sources: collectedResponses[model]?.sources || [],
                                isReal: model === realModel
                            };
                        });
                        
                        setMultiLlmResponses(simulatedResponses);
                    }
                } 
                
                responseComplete = true;
            }
        }, 5000); // Longer backup timeout

        // Set initialized to true
        if (!initialized) {
            setInitialized(true);
            await changeChat(modelChatIds[selectedModel]);
        }
    };

    useEffect(() => {
        if (!chat) {
            setMessages([]);
            setInitialized(false);
            setLatestResponse('');
            setLatestUserMessage('');
            setLatestSources([]);
            return;
        }
        const fetchMessages = async () => {
            const { data: messagesData, error: messagesError } = await supabaseClient
                .from('chat_history')
                .select('prompt, response, metadata')
                .eq('chat_id', chat.id)
                .order('created_at', { ascending: false });
            if (messagesError) throw messagesError;

            if (messagesData.length === 0) {
                setMessages([]);
                setInitialized(false);
                setLatestResponse('');
                setLatestUserMessage('');
                setLatestSources([]);
            }
            else {
                const messages = messagesData.map(message => {
                    // Parse metadata to get sources and multi-LLM data if available
                    let sources = [];
                    if (message.metadata && message.metadata.sources) {
                        sources = message.metadata.sources;
                    }
                    
                    // Check if this was a multi-LLM message
                    if (message.metadata && message.metadata.multiLlm) {
                        return {
                            multiLlm: true,
                            models: message.metadata.models || [],
                            guessCorrect: message.metadata.guessCorrect || false,
                            guessedModel: message.metadata.guessedModel || null,
                            user: {
                                text: message.prompt,
                                objects: [],
                            },
                        };
                    } else {
                        // Regular single-LLM message
                        return { 
                            model: {
                                text: message.response,
                                sources: sources,
                                objects: [],
                            },
                            user: {
                                text: message.prompt,
                                objects: [],
                            },
                        };
                    }
                });
                setMessages(messages.slice(1).reverse());
                setInitialized(true);
                
                // Set latest response data - this might be a multi-LLM response
                if (messages[0].multiLlm) {
                    // For multi-LLM messages, we need to restore the list of responses
                    setMultiLlmResponses(messages[0].models || []);
                    
                    // Find the model that was marked as real
                    const realModel = messages[0].models.find(m => m.isReal) || messages[0].models[0];
                    setLatestResponse(realModel ? realModel.response : '');
                    setLatestSources(realModel ? realModel.sources : []);
                } else {
                    // Regular message
                    setLatestResponse(messages[0].model.text);
                    setLatestSources(messages[0].model.sources || []);
                }
                
                setLatestUserMessage(messages[0].user.text);
            }
        };
        fetchMessages();
    }, [chat]);

    useEffect(() => {
        const changeSelectedChat = async () => {
            await changeChat(modelChatIds[selectedModel]);
        };
        changeSelectedChat();
    }, [selectedModel]);

    // Add useEffect for logging state changes
    // useEffect(() => {
    //     console.log('Chat Interface State Update:', {
    //         messages,
    //         latestUserMessage,
    //         latestResponse,
    //         latestSources,
    //         selectedModel,
    //         currentSelectedModel,
    //         multiLlmResponses,
    //         currentGuessIndex,
    //         guessStats,
    //         modelResponses,
    //         allGuesses,
    //         modelChatIds
    //     });
    // }, [
    //     messages,
    //     latestUserMessage,
    //     latestResponse,
    //     latestSources,
    //     selectedModel,
    //     currentSelectedModel,
    //     multiLlmResponses,
    //     currentGuessIndex,
    //     guessStats,
    //     modelResponses,
    //     allGuesses,
    //     modelChatIds
    // ]);

    return (
        <div>
            <ChatControl />
            
            <div style={{ margin: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>

            {!initialized && (
                <div>
                    <label htmlFor="model-selector" style={{ marginRight: '10px', fontSize: '14px' }}>
                        LLM Model:
                    </label>
                <select
                    id="model-selector"
                    value={selectedModel}
                    onChange={(e) => {
                        const newModel = e.target.value;
                        setSelectedModel(newModel);
                        
                        // Handle displaying appropriate response for the selected model
                        if (newModel !== 'game') {
                            setCurrentSelectedModel(newModel);
                            
                            // If we have a stored response for this model, display it
                            if (modelResponses[newModel] && modelResponses[newModel].text) {
                                setLatestResponse(modelResponses[newModel].text);
                                setLatestSources(modelResponses[newModel].sources || []);
                            }
                        }
                    }}
                    style={{ padding: '5px', borderRadius: '4px' }}
                >
                    <option value="game">Guessing Game</option>
                    <option value="default">Default</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="claude-3">Claude 3</option>
                        <option value="llama-3">Llama 3</option>
                    </select>
                </div>
            )}
                
                {guessGameEnabled && (
                    <div style={{ marginLeft: '15px', fontSize: '14px' }}>
                        Score: {guessStats.correct} correct / {guessStats.incorrect} incorrect
                    </div>
                )}
            </div>
            
            <ChatBox onUserInput={onUserInput} />
            
            {guessGameEnabled && multiLlmResponses.length > 0 && (
                <LlmGuessGame
                    llmResponses={multiLlmResponses}
                    onGuess={handleLlmGuess}
                    currentGuessIndex={currentGuessIndex}
                />
            )}
            
            {guessGameEnabled && multiLlmResponses.length === 0 && latestUserMessage && (
                <div className={styles.convoHistoryContainer}>
                    <h2 className={utilStyles.headingLg}>Which LLM wrote this?</h2>
                    <div className={`${styles.convoDiv} ${styles.respDiv}`}>
                        <img src='/icons/bot.png' alt='bot' className={styles.convoImg} />
                        <div className={styles.convoRespWait}>
                            <img src='/icons/magnifying-glass.png' alt='thinking' />
                        </div>
                    </div>
                </div>
            )}
            
            {guessGameEnabled && allGuesses.length > 0 && currentGuessIndex !== null && (
                <GuessHistory guesses={allGuesses} />
            )}
            
            {!guessGameEnabled && (
                <ChatHistory 
                    messages={messages} 
                    latestUserMessage={latestUserMessage} 
                    latestResponse={latestResponse}
                    latestSources={latestSources}
                    selectedModel={selectedModel !== 'default' ? selectedModel : null}
                />
            )}
            
            {guessGameEnabled && multiLlmResponses.length === 0 && !latestUserMessage && (
                <ChatHistory 
                    messages={messages}
                    latestUserMessage="" 
                    latestResponse=""
                    latestSources={[]}
                    selectedModel={null}
                />
            )}
        </div>
    );
};

export default ChatInterface;