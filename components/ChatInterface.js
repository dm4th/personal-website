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
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    model: {
                        text: latestResponse,
                        objects: [],
                    },
                    user: {
                        text: latestUserMessage,
                        objects: [],
                    },
                },
            ]);
        }
        setLatestUserMessage(userInput);
        setLatestResponse('');

        // Send the user input to the bot, setting up a connection to the server
        // const modelResponse = await system_chain_chat(userInput);
        const functionUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
        const chatUrl = functionUrl + chatEndpoint();
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const postData = JSON.stringify({ prompt: userInput, chat_id: chat?.id, user_id: user?.id });
        console.log(postData);
        let tempChatId = null;
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
            return;
        }
        const fetchMessages = async () => {
            const { data: messagesData, error: messagesError } = await supabaseClient
                .from('chat_history')
                .select('prompt, response')
                .eq('chat_id', chat.id)
                .order('created_at', { ascending: false });
            if (messagesError) throw messagesError;

            if (messagesData.length === 0) {
                setMessages([]);
                setInitialized(false);
                setLatestResponse('');
                setLatestUserMessage('');
            }

            else {
                const messages = messagesData.map(message => {
                    return { 
                        model: {
                            text: message.response,
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
            }
        };
        fetchMessages();
    }, [chat]);

    return (
        <div>
            <ChatControl />
            <ChatBox onUserInput={onUserInput} />
            <ChatHistory messages={messages} latestUserMessage={latestUserMessage} latestResponse={latestResponse} />
        </div>
    );
};

export default ChatInterface;