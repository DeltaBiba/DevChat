import React, { useState, useRef, useEffect } from "react";
import styles from "./Chat.module.css";
import { useAuth } from "../../auth/AuthContext";

export const Chat = () => {
  const {user} = useAuth();
  const [chats, setChats] = useState([
    { id: 1, content: "Chat 1" },

  ]);
const handleAddChat = () => {
  const name = prompt("Enter new chat name:");
  if (name && name.trim()) {
    const newChat = {
      id: chats.length + 1,
      content: name.trim()
    };
    setChats([...chats, newChat]);
  }
};

const [editingTitle, setEditingTitle] = useState(false);
const [chatTitleInput, setChatTitleInput] = useState("");

const handleTitleDoubleClick = () => {
  if (selectedChat) {
    setEditingTitle(true);
    setChatTitleInput(selectedChat.content);
  }
};

const handleTitleChange = (e) => {
  setChatTitleInput(e.target.value);

};

const handleTitleBlur = () => {
  if (chatTitleInput.trim()) {
    // Update selectedChat
    const updatedChat = { ...selectedChat, content: chatTitleInput };

    // Update chat in list
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === updatedChat.id ? updatedChat : chat
      )
    );

    // Set current chat to updated one
    setSelectedChat(updatedChat);
  }
  setEditingTitle(false);
};


const handleTitleKeyDown = (e) => {
  if (e.key === "Enter") {
    handleTitleBlur();
  }
};

  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (input.trim() !== "") {
      const newMessage = {
        text: input,
        sender: "me",
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
      <div className={styles.chatItems}>
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={styles.chatItem}
            onClick={() => {
              setSelectedChat(chat);
              setMessages([]);
            }}
          >
            <h2>{chat.content}</h2>
          </div>
        ))}
      </div>
      <button className={styles.addChatButton} onClick={handleAddChat}>
        ➕ Add Chat
      </button>
    </div>



      {/* Right panel - Chat window */}
      <div className={styles.chatWindow}>
        <div className={styles.chatHeader}>
          <div className={styles.chatTitle} onDoubleClick={handleTitleDoubleClick}>
            {editingTitle ? (
              <input
                className={styles.titleInput}
                value={chatTitleInput}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                autoFocus
              />
            ) : (
              <h2>{selectedChat ? selectedChat.content : "Choose the chat"}</h2>
            )}
          </div>

          <div className={styles.userBar}>
            <span className={styles.username}>👤 {user?.username}</span>
          </div>
        </div>

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
