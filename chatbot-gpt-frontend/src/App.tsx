import React, { FormEvent, useState } from "react";
import axios from "axios";
import "./App.css"; // Ensure you have the corresponding CSS for loader

const App = () => {
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>(
    []
  );
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Define your button labels and any associated actions or messages
  const buttons = [
    {
      label: "I'm unemployed and need to pay bills.",
      message: "I'm unemployed and need to pay bills.",
    },
    {
      label: "I need financial assistance.",
      message: "I need financial support.",
    },
    {
      label: "I'm looking to get assistive technology.",
      message: "I'm looking to get assistive technology",
    },
    // ... add other buttons as needed
  ];

  const handleButtonClick = async (buttonMessage: string) => {
    const userMessage = {
      text: buttonMessage,
      sender: "user",
    };

    setMessages([...messages, userMessage]);
    setIsLoading(true); // Start loading

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/message`, {
        message: buttonMessage,
      });
      const botMessage = {
        text: response.data,
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        text: "Error occurred while sending message.",
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setIsLoading(false); // Stop loading once the response is received or an error occurs
  };

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const message = {
      text: input,
      sender: "user",
    };

    setMessages([...messages, message]);
    setIsLoading(true); // Start loading

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/message`, { message: input });
      const botMessage = {
        text: response.data,
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        text: "Error occurred while sending message.",
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setIsLoading(false); // Stop loading
    setInput("");
  };

  return (
    <div className="chat-container">
      <h2>Hello there, welcome to DAISY</h2>
      <p>How can I help you today?</p>
      <div className="button-group">
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={() => handleButtonClick(button.message)}
            disabled={isLoading}
          >
            {button.label}
          </button>
        ))}
      </div>
      <div id="chat-window" className="clearfix">
        {messages.map((m, index) => (
          <div key={index} className={`message ${m.sender}`}>
            {m.text}
          </div>
        ))}
        {isLoading && <div className="loader"></div>} {/* Loader element */}
      </div>
      <form onSubmit={sendMessage} className="query-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Talk to Daisy..."
          autoFocus
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default App;
