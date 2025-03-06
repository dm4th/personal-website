// React imports
import React, { useState, useEffect } from 'react';

// Networking Imports
import { fetchEventSource } from '@microsoft/fetch-event-source';
import ChatBox from '@/components/ChatBox.js';
import ChatControl from '@/components/ChatControl.js';
import ChatHistory from '@/components/ChatHistory.js';

// Supabase Imports
import { useSupaUser } from '@/lib/SupaContextProvider';

const ChatInterface = ({ }) => {
    // Get Supabase User context
    const { user, chat, chatRole, changeChat, supabaseClient } = useSupaUser();

    const [initialized, setInitialized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [latestUserMessage, setLatestUserMessage] = useState('');
    const [latestResponse, setLatestResponse] = useState('');
    const [latestSources, setLatestSources] = useState([]);

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
            
            // Add message to history
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    model: {
                        text: currentResponse,
                        sources: currentSources,
                        objects: [],
                    },
                    user: {
                        text: currentUserMessage,
                        objects: [],
                    },
                },
            ]);
        }
        
        // Reset states for new message
        setLatestUserMessage(userInput);
        setLatestResponse('');
        setLatestSources([]);

        // Send the user input to the bot, setting up a connection to the server
        const isDevelopment = process.env.NODE_ENV === 'development';
        const functionUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
        const chatUrl = functionUrl + chatEndpoint();
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const postData = JSON.stringify({ 
            prompt: userInput, 
            chat_id: chat?.id, 
            user_id: user?.id,
            include_sources: true // Signal to backend we want source references
        });
        console.log(postData);
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
        
        await fetchEventSource(
            chatUrl,
            {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${anonKey}`,
                    'apikey': anonKey
                },
                body: postData,
                onmessage(event) {
                    const data = JSON.parse(event.data);
                    if (data.chat_id) {
                        tempChatId = data.chat_id;
                    }
                    if (data.token) {
                        setLatestResponse((i) => i + data.token);
                    }
                    if (data.sources) {
                        setLatestSources(data.sources);
                    }
                },
            }
        );

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
                    // Parse metadata to get sources if available
                    let sources = [];
                    if (message.metadata && message.metadata.sources) {
                        sources = message.metadata.sources;
                    }

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
                });
                setMessages(messages.slice(1).reverse());
                setInitialized(true);
                setLatestResponse(messages[0].model.text);
                setLatestUserMessage(messages[0].user.text);
                setLatestSources(messages[0].model.sources || []);
            }
        };
        fetchMessages();
    }, [chat]);

    return (
        <div>
            <ChatControl />
            <ChatBox onUserInput={onUserInput} />
            <ChatHistory 
                messages={messages} 
                latestUserMessage={latestUserMessage} 
                latestResponse={latestResponse}
                latestSources={latestSources}
            />
        </div>
    );
};

export default ChatInterface;