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
    
    // Helper function to generate fake responses with model-specific styling
    const generateFakeResponse = (realResponse, model) => {
        let fakeResponse = realResponse;
        
        switch (model) {
            case 'gpt-4':
                // GPT-4 style: More structured, uses bullet points, more formal
                fakeResponse = fakeResponse.replaceAll('.', '.\n\n');
                if (!fakeResponse.includes('•')) {
                    fakeResponse = fakeResponse.replace(/\n\n([A-Z])/g, '\n\n• $1');
                }
                // Add more professional/formal tone
                fakeResponse = fakeResponse.replace(/I think/gi, 'Based on my analysis');
                fakeResponse = fakeResponse.replace(/probably/gi, 'likely');
                break;
                
            case 'claude-3':
                // Claude style: More conversational, slightly longer sentences
                fakeResponse = fakeResponse.replace(/\./g, ', and.');
                fakeResponse = fakeResponse.replace(/,\s*and\./g, '.');
                // Add more "helpful" tone
                fakeResponse = fakeResponse.replace(/I would/gi, 'I\'d be happy to');
                fakeResponse = fakeResponse.replace(/you can/gi, 'you might consider');
                break;
                
            case 'llama-3':
                // Llama style: More concise, direct, sometimes emoji
                fakeResponse = fakeResponse.replace(/\n\n/g, '\n');
                fakeResponse = fakeResponse.replace(/([\.\?!]) /g, '$1\n');
                // Add more casual tone
                const emojiList = ['👍', '✨', '🚀', '💡'];
                const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
                fakeResponse += `\n\n${randomEmoji} Hope that helps!`;
                break;
                
            default:
                // Minor modifications for other models
                fakeResponse = fakeResponse.replace(/I/g, 'This model');
                break;
        }
        
        return fakeResponse;
    };
    
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
            
            // If in game mode with responses but no guess was made, make a random guess
            if (guessGameEnabled && multiLlmResponses.length > 0 && currentGuessIndex === null) {
                // Make a random guess
                const randomGuessIndex = Math.floor(Math.random() * multiLlmResponses.length);
                handleLlmGuess(randomGuessIndex);
                
                // Note: We let handleLlmGuess update allGuesses, but we need to set currentGuessIndex
                // for the message saving below
                const correctIndex = multiLlmResponses.findIndex(r => r.isReal);
                const isCorrect = randomGuessIndex === correctIndex;
                
                console.log(`Auto-selected guess: ${multiLlmResponses[randomGuessIndex].model} (correct: ${isCorrect})`);
            }
            
            // Determine what to save based on whether guess game is active
            if (guessGameEnabled && multiLlmResponses.length > 0) {
                // For guess game, save all LLM responses and user's guesses
                const guessIndex = currentGuessIndex !== null ? currentGuessIndex : Math.floor(Math.random() * multiLlmResponses.length);
                
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        multiLlm: true,
                        models: multiLlmResponses,
                        guessCorrect: true, // We're either using a user guess or auto-selected one
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

        // Send the user input to the bot, setting up a connection to the server
        const isDevelopment = process.env.NODE_ENV === 'development';
        const functionUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
        const chatUrl = functionUrl + chatEndpoint();
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        let tempChatId = null;
        
        // In development, we'll call our test-sources API to get mock sources first
        if (isDevelopment) {
            try {
                console.log("Fetching test sources...");
                const response = await fetch('/api/test-sources', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: userInput })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.sources && data.sources.length > 0) {
                        console.log("Setting sources from test API:", data.sources);
                        setLatestSources(data.sources);
                        
                        // Store the sources for this chat message specifically in a ref to make sure they're captured
                        window.lastSources = data.sources;
                    }
                }
            } catch (error) {
                console.error("Error fetching test sources:", error);
            }
        }
        
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
            
            console.log(`Selected ${realModel} as the real model for this game round`);
            
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
                        chat_id: chat?.id,
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
                                        if (data.chat_id && !tempChatId) {
                                            tempChatId = data.chat_id;
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
                                        
                                        // For models that aren't the "real" one, modify their responses to make them 
                                        // reflect each model's distinct style
                                        if (model !== realModel) {
                                            collectedResponses[model].text = generateFakeResponse(
                                                collectedResponses[model].text, 
                                                model
                                            );
                                        }
                                        
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
                                            
                                            console.log("Final responses for guessing game:", finalResponses.map(r => 
                                                `${r.model} (real: ${r.isReal}): ${r.response.substring(0, 20)}...`));
                                            
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
                chat_id: chat?.id,
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
                        const data = JSON.parse(event.data);
                        if (data.chat_id) {
                            tempChatId = data.chat_id;
                        }
                        if (data.token) {
                            selectedModelResponse += data.token;
                            setLatestResponse(selectedModelResponse);
                            
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
                    }
                }
            );
        }
        
        // Backup logic in case onclose doesn't fire (which can happen in some browsers)
        setTimeout(() => {
            if (!responseComplete) {
                console.log("Backup timer fired - finalizing responses");
                
                if (selectedModel === 'game' && Object.keys(collectedResponses).length > 0) {
                    // Create responses from what we have
                    const activeModels = llmModels.slice(1);
                    const realModelIndex = activeModels.findIndex(model => 
                        collectedResponses[model] && collectedResponses[model].text.length > 0);
                    
                    if (realModelIndex >= 0) {
                        const realModel = activeModels[realModelIndex];
                        
                        // Create simulated responses for all models
                        const simulatedResponses = activeModels.map(model => {
                            if (model === realModel) {
                                // Use the real response we have
                                return {
                                    model,
                                    response: collectedResponses[model]?.text || "Response unavailable",
                                    sources: collectedResponses[model]?.sources || [],
                                    isReal: true
                                };
                            } else {
                                // Generate a fake response
                                const baseText = collectedResponses[realModel]?.text || "Response unavailable";
                                return {
                                    model,
                                    response: generateFakeResponse(baseText, model),
                                    sources: collectedResponses[realModel]?.sources || [],
                                    isReal: false
                                };
                            }
                        });
                        
                        setMultiLlmResponses(simulatedResponses);
                    }
                } else if (selectedModel !== 'default' && latestResponse) {
                    // Style the single model response
                    const styledResponse = generateFakeResponse(latestResponse, selectedModel);
                    setLatestResponse(styledResponse);
                }
                
                responseComplete = true;
            }
        }, 5000); // Longer backup timeout

        // Set initialized to true
        if (!initialized) {
            await changeChat(tempChatId);
            setInitialized(true);
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

    return (
        <div>
            <ChatControl />
            
            {/* Model selector */}
            <div style={{ margin: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
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
                
                {guessGameEnabled && (
                    <div style={{ marginLeft: '15px', fontSize: '14px' }}>
                        Score: {guessStats.correct} correct / {guessStats.incorrect} incorrect
                    </div>
                )}
            </div>
            
            <ChatBox onUserInput={onUserInput} />
            
            {/* Game component (only in game mode with responses) */}
            {guessGameEnabled && multiLlmResponses.length > 0 && (
                <LlmGuessGame
                    llmResponses={multiLlmResponses}
                    onGuess={handleLlmGuess}
                    currentGuessIndex={currentGuessIndex}
                />
            )}
            
            {/* Show the waiting state when in game mode without responses yet */}
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
            
            {/* Show guess history in game mode after current guess is complete */}
            {guessGameEnabled && allGuesses.length > 0 && currentGuessIndex !== null && (
                <GuessHistory guesses={allGuesses} />
            )}
            
            {/* Show chat history only when not in game mode or when there's no active waiting/response in game mode */}
            {(!guessGameEnabled || (multiLlmResponses.length === 0 && !latestUserMessage)) && (
                <ChatHistory 
                    messages={messages} 
                    latestUserMessage={!guessGameEnabled ? latestUserMessage : ''} 
                    latestResponse={!guessGameEnabled ? latestResponse : ''}
                    latestSources={!guessGameEnabled ? latestSources : []}
                    selectedModel={selectedModel !== 'default' ? selectedModel : null}
                />
            )}
        </div>
    );
};

export default ChatInterface;