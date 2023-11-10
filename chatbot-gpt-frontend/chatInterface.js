import React, { useState } from 'react';
import axios from 'axios';


const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const handleButtonClick = async (predefinedMessage) => {
        // This function will be called when a button is clicked
        // Use this predefinedMessage to send to the chatbot API

        const userMessage = {
            text: predefinedMessage,
            sender: 'user'
        };
        setMessages([...messages, userMessage]);

        try {
            const response = await axios.post('/api/message', { message: predefinedMessage });
            const botMessage = {
                text: response.data,
                sender: 'bot'
            };
            setMessages(prevMessages => [...prevMessages, userMessage, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                text: 'Error occurred while sending message.',
                sender: 'bot'
            };
            setMessages(prevMessages => [...prevMessages, userMessage, errorMessage]);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        const message = {
            text: input,
            sender: 'user'
        };
        setMessages([...messages, message]);

        try {
            const response = await axios.post('/api/message', { message: input });
            const botMessage = {
                text: response.data,
                sender: 'bot'
            };
            setMessages([...messages, message, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                text: 'Error occurred while sending message.',
                sender: 'bot'
            };
            setMessages([...messages, message, errorMessage]);
        }

        setInput('');
    };

    return (
        <div>
            <h2>Chat with GPT-3</h2>
            <div id="chat-window">
                {messages.map((m, index) => (
                    <div key={index} className={`message ${m.sender}`}>
                        {m.text}
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message here..."
                    autoFocus
                />
                <button type="submit">Send</button>
            </form>
            <div>
                <button style={{ visibility: 'visible', display: 'inline-block' }}>Test Button</button>
                <button className="button" onClick={() => handleButtonClick('Hello!')}>Greet</button>
                <button className="button" onClick={() => handleButtonClick('Goodbye!')}>Goodbye</button>
            </div>
        </div>
    );
};

export default ChatInterface;
