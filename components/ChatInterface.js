// React imports
import React, { useState, useEffect } from 'react';

// Networking Imports
import { fetchEventSource } from '@microsoft/fetch-event-source';

const ChatInterface = ({ onChangeRole }) => {
    const [role, setRole] = useState('none');
    const [initialized, setInitialized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [latestUserMessage, setLatestUserMessage] = useState('');
    const [latestResponse, setLatestResponse] = useState('');

    

    return (
        <div>
        </div>
    );
};

export default ChatInterface;