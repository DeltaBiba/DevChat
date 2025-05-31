import React, { useState, useRef, useEffect } from "react";
import styles from "./Chat.module.css";
import { useAuth } from "../../auth/AuthContext";
import { chatAPI } from "../../services/api";
import { socketService } from "../../services/socket";

export const Chat = () => {
  const { user } = useAuth();
  
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  
  const [editingTitle, setEditingTitle] = useState(false);
  const [chatTitleInput, setChatTitleInput] = useState("");
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChats();
    
    socketService.connect();
    
    socketService.onMessage((message) => {
      if (selectedChat && message.chat_id === selectedChat.chat_id) {
        setMessages(prev => [...prev, message]);
      }
    });
    
    return () => {
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.chat_id);
      socketService.joinChat(selectedChat.chat_id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    setLoadingChats(true);
    setError("");
    
    const result = await chatAPI.getChats();
    
    if (result.success) {
      setChats(result.data);
    } else {
      setError(`Failed to load chats: ${result.error}`);
    }
    
    setLoadingChats(false);
  };

  const loadMessages = async (chatId) => {
    setLoadingMessages(true);
    setError("");
    
    const result = await chatAPI.getMessages(chatId);
    
    if (result.success) {
      setMessages(result.data);
    } else {
      setError(`Failed to load messages: ${result.error}`);
    }
    
    setLoadingMessages(false);
  };
  

  const handleCreateChatWithUser = async () => {
    const username = prompt("Enter username to chat with:");
    if (!username || !username.trim()) return;
    
    setError("");
    
    const result = await chatAPI.createChatWithUser(username.trim());
    
    if (result.success) {
      if (result.data.existing) {
        const existingChat = chats.find(chat => chat.chat_id === result.data.chat_id);
        if (existingChat) {
          setSelectedChat(existingChat);
        } else {
          setChats(prev => [...prev, result.data]);
          setSelectedChat(result.data);
        }
      } else {
        setChats(prev => [...prev, result.data]);
        setSelectedChat(result.data);
      }
    } else {
      setError(`Failed to create chat with ${username}: ${result.error}`);
    }
  };

  const handleTitleDoubleClick = () => {
    if (selectedChat) {
      setEditingTitle(true);
      setChatTitleInput(selectedChat.name);
    }
  };

  const handleTitleChange = (e) => {
    setChatTitleInput(e.target.value);
  };

  const handleTitleBlur = () => {
    if (chatTitleInput.trim() && chatTitleInput !== selectedChat.name) {
      const updatedChat = { ...selectedChat, name: chatTitleInput.trim() };
      
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.chat_id === updatedChat.chat_id ? updatedChat : chat
        )
      );
      
      setSelectedChat(updatedChat);
    }
    setEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    }
    if (e.key === "Escape") {
      setEditingTitle(false);
      setChatTitleInput(selectedChat.name);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedChat || !user) return;
    
    const messageText = input.trim();
    setInput("");
    
    socketService.sendMessage(
      selectedChat.chat_id,
      messageText,
      user.id,
      user.username
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setError("");
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatList}>
        <div className={styles.chatItems}>
          {loadingChats ? (
            <div className={styles.loading}>Loading chats...</div>
          ) : chats.length === 0 ? (
            <div className={styles.loading}>No chats yet. Create one!</div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.chat_id}
                className={`${styles.chatItem} ${
                  selectedChat?.chat_id === chat.chat_id ? styles.active : ""
                }`}
                onClick={() => handleChatSelect(chat)}
              >
                <h2>{chat.name}</h2>
                {chat.is_group && <span className={styles.groupIcon}>Group</span>}
              </div>
            ))
          )}
        </div>
        
        <button className={styles.addChatButton} onClick={handleCreateChatWithUser}>
          Chat with User
        </button>
      </div>

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
              <h2>
                {selectedChat ? selectedChat.name : "Choose a chat"}
                {selectedChat?.is_group && " (Group)"}
              </h2>
            )}
          </div>

          <div className={styles.userBar}>
            <span className={styles.username}>{user?.username}</span>
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
            <button onClick={() => setError("")}>X</button>
          </div>
        )}

        <div className={styles.messageArea}>
          {!selectedChat ? (
            <div className={styles.noChat}>
              <h3>Welcome to DevChat!</h3>
              <p>Select a chat or create a new one to start messaging</p>
            </div>
          ) : loadingMessages ? (
            <div className={styles.loading}>Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className={styles.noMessages}>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.message_id || index}
                className={`${styles.messageBubble} ${
                  msg.sender_id === user?.id ? styles.myMessage : styles.theirMessage
                }`}
              >
                <div className={styles.messageContent}>{msg.text}</div>
                <div className={styles.messageInfo}>
                  <span className={styles.sender}>{msg.sender_name}</span>
                  <span className={styles.timestamp}>
                    {new Date(msg.sent_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {selectedChat && (
          <div className={styles.inputArea}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={styles.textInput}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loadingMessages}
            />
            <button
              onClick={handleSend}
              className={styles.sendButton}
              disabled={!input.trim() || loadingMessages}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};