import React, { useState, useRef, useEffect } from "react";
import styles from "./Chat.module.css";

export const Chat = () => {
  const chats = [
    { id: 1, content: <h2>Chat 1</h2> },
    { id: 2, content: <h2>Chat 2</h2> },
    { id: 3, content: <h2>Chat 3</h2> },
    { id: 4, content: <h2>Chat 4</h2> },
  ];

  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (input.trim() !== "") {
      const newMessage = {
        text: input,
        sender: "me", // marking the message as "mine"
      };
      setMessages([...messages, newMessage]);
      setInput("");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={styles.chatContainer}>
      {/* Left panel - Chat list */}
      <div className={styles.chatList}>
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={styles.chatItem}
            onClick={() => {
              setSelectedChat(chat);
              setMessages([]); // optional: clear messages when switching chats
            }}
          >
            {chat.content}
          </div>
        ))}
      </div>

      {/* Right panel - Chat window */}
      <div className={styles.chatWindow}>
        <h2>{selectedChat ? selectedChat.content : "Choose the chat"}</h2>

        {/* Message display area */}
        <div className={styles.messageArea}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.messageBubble} ${
                msg.sender === "me" ? styles.myMessage : styles.theirMessage
              }`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input section */}
        {selectedChat && (
          <div className={styles.inputArea}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={styles.textInput}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend} className={styles.sendButton}>
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
