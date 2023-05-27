// React imports
import React, { useState, useEffect } from 'react';

// Networking Imports
import { fetchEventSource } from '@microsoft/fetch-event-source';
import ChatBox from '@/components/ChatBox.js';
import ChatControl from '@/components/ChatControl.js';

// Supabase Imports
import { useSupaUser } from '@/lib/SupaContextProvider';

const ChatInterface = ({ onChangeRole }) => {
    // Get Supabase User context
    const { user, userDetails, chatRole, availableChatRoles, updateUserDetails, updateChatRole, updateAvailableChatRoles, supabaseClient } = useSupaUser();

    // const [initialized, setInitialized] = useState(false);
    const [chatId, setChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [latestUserMessage, setLatestUserMessage] = useState('');
    const [latestResponse, setLatestResponse] = useState('');

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
        const chatUrl = functionUrl + chatEndpoint;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const postData = JSON.stringify({ prompt: userInput, chat_id: chatId });
        console.log(postData);
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
                    console.log(event);
                    const { token, chat_id } = JSON.parse(event.data);
                    if (chat_id) {
                        setChatId(chat_id);
                    } else {
                        setLatestResponse((i) => i + token);
                    }
                },
            }
        );

        // Set initialized to true
        if (!initialized) {
            setInitialized(true);
        }

    };

    useEffect(() => {
        if (!user) return;
        updateUserDetails();
        updateAvailableChatRoles();
    }, [user]);

    useEffect(() => {
        if (!chatId) {
            setMessages([]);
            return;
        }
        const fetchMessages = async () => {
            const { data: messagesData, error: messagesError } = await supabaseClient
                .from('chat_history')
                .select('prompt, response')
                .eq('chat_id', chatId)
                .order('created_at', { ascending: true });
            if (messagesError) throw messagesError;
            if (messagesData.length === 0) setMessages([]);
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
                setMessages(messages);
            }
        };
        fetchMessages();
    }, [chatId]);

    return (
        <div>
            <ChatControl updateChatId={setChatId} />
            <ChatBox onUserInput={onUserInput} />
        </div>
    );
};

export default ChatInterface;