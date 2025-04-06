import React, { useState } from "react";
import styles from "./Chat.module.css";

export const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  const chats = ["Chat 1", "Chat 2", "Chat 3", "Chat 4"];

  return (
    <div className={styles.chatContainer}>
      {/* Left Side - Chat List */}
      <div className={styles.chatList}>
        {chats.map((chat, index) => (
          <div
            key={index}
            className={styles.chatItem}
            onClick={() => setSelectedChat(chat)}
          >
            {chat}
          </div>
        ))}
      </div>

      {/* Right Side - Chat Display */}
      <div className={styles.chatWindow}>
        <h2>
          {selectedChat ? selectedChat : "Choose the chat"}
        </h2>
        
      </div>
    </div>
  );
};
