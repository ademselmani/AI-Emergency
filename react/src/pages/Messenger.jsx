import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { FiSearch, FiMessageSquare, FiSend, FiUser, FiChevronLeft } from 'react-icons/fi';
import { IoMdNotifications } from 'react-icons/io';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io('http://localhost:3000');

const Messenger = () => {
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConv, setCurrentConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [unreadMap, setUnreadMap] = useState({});
  const [showConversations, setShowConversations] = useState(true);
  const [mobileView, setMobileView] = useState(false);
  const messagesEndRef = useRef(null);
  const userCacheRef = useRef({});

  // Check mobile view on resize
  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Token and user ID handling
  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (!stored) return;
    setToken(stored);
    try {
      const decoded = JSON.parse(atob(stored.split('.')[1]));
      setUserId(decoded.id);
    } catch (err) {
      console.error('Token invalide', err);
    }
  }, []);

  // Fetch conversations
  useEffect(() => {
    if (!token) return;
    axios.get('http://localhost:3000/api/conversations', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setConversations(res.data);
      const map = {};
      res.data.forEach(conv => {
        map[conv._id] = 0;
        socket.emit('joinConversation', conv._id);
      });
      setUnreadMap(map);
    })
    .catch(console.error);
  }, [token]);

  // Fetch messages for current conversation
  useEffect(() => {
    if (!currentConv) return;
    setUnreadMap(prev => ({ ...prev, [currentConv._id]: 0 }));
    axios.get(`http://localhost:3000/api/messages/${currentConv._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setMessages(res.data))
    .catch(console.error);
  }, [currentConv, token]);

  // Socket message handler
  useEffect(() => {
    const handler = (msg) => {
      if (currentConv && msg.conversation === currentConv._id) {
        setMessages(prev => [...prev, msg]);
      } else if (msg.sender?._id !== userId) {
        setUnreadMap(prev => ({
          ...prev,
          [msg.conversation]: (prev[msg.conversation] || 0) + 1
        }));
      }
    };
    socket.on('newMessage', handler);
    return () => { socket.off('newMessage', handler); };
  }, [currentConv, userId]);

  const fetchUserName = async (id) => {
    if (userCacheRef.current[id]) return userCacheRef.current[id];
    try {
      const res = await axios.get(`http://localhost:3000/employee/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { firstName, lastName, name, familyName } = res.data;
      const fullName = `${firstName||name||''} ${lastName||familyName||''}`.trim();
      userCacheRef.current[id] = fullName;
      return fullName;
    } catch {
      return 'Inconnu';
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      const res = await axios.get(`http://localhost:3000/employee/search?q=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(res.data);
      setSearch('');
    } catch (err) {
      console.error(err);
    }
  };

  const createConversation = async (receiverId) => {
  // Vérifier si une conversation existe déjà
  const existingConv = conversations.find(conv =>
    conv.participants.some(p => p._id === receiverId)
  );

  if (existingConv) {
    setCurrentConv(existingConv);
    setShowConversations(false);
    return;
  }

  try {
    const res = await axios.post(
      'http://localhost:3000/api/conversations',
      { senderId: userId, receiverId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setConversations(prev => [...prev, res.data]);
    socket.emit('joinConversation', res.data._id);
    setUnreadMap(prev => ({ ...prev, [res.data._id]: 0 }));
    setCurrentConv(res.data);
    setShowConversations(false);
  } catch (err) {
    console.error(err.response?.data || err);
  }
};


  const handleSend = async () => {
    if (!text.trim() || !currentConv) return;
    try {
      await axios.post('http://localhost:3000/api/messages',
        { conversationId: currentConv._id, text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isMyMessage = msg => msg?.sender?._id === userId;

  const getFullName = sender => {
    if (!sender) return 'Inconnu';
    return `${sender.firstName || sender.name || ''} ${sender.lastName || sender.familyName || ''}`.trim();
  };

  if (!userId) return <div className="loading">Chargement…</div>;

  return (
    <div className="messenger-container">
      {/* Sidebar */}
      <AnimatePresence>
        {(showConversations || !mobileView) && (
          <motion.div 
            className="sidebar"
            initial={mobileView ? { x: -300 } : {}}
            animate={mobileView ? { x: 0 } : {}}
            exit={mobileView ? { x: -300 } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="search-section">
              <h3><FiSearch /> Search</h3>
              <div 
                className="search-box"
                onMouseEnter={() => mobileView ? null : setShowConversations(false)}
                onMouseLeave={() => mobileView ? null : setShowConversations(true)}
              >
                <div className="search-input-container">
                  <input
                    type="text"
                    placeholder="Name or email…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                  />
                  <button onClick={handleSearch} className="search-button">
                    <FiSearch />
                  </button>
                </div>
                
                <ul className="search-results">
                  {searchResults.map(user => (
                    <motion.li 
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="user-info">
                        <div className="user-avatar">
                          <FiUser />
                        </div>
                        <div className="user-details">
                          <div className="user-name">
                            {(user.firstName||user.name)+' '+(user.lastName||user.familyName||'')}
                          </div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => createConversation(user._id)} 
                        className="message-button"
                      >
                        <FiMessageSquare />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="divider"></div>
            
            <div className="conversations-section">
              <h3><FiMessageSquare /> Conversations</h3>
              <div className="conversations-list">
                {conversations.map(conv => (
                  <motion.div 
                    key={conv._id} 
                    onClick={() => {
                      setCurrentConv(conv);
                      if (mobileView) setShowConversations(false);
                    }}
                    className={`conversation-item ${currentConv?._id === conv._id ? 'active' : ''}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="conversation-avatar">
                      <FiUser />
                    </div>
                    <div className="conversation-details">
                      <div className="conversation-name">
                        {getFullName(conv.participants.find(p => p._id !== userId))}
                      </div>
                      <div className="conversation-preview">
                        {messages.find(m => m.conversation === conv._id)?.text || ''}
                      </div>
                    </div>
                    {unreadMap[conv._id] > 0 && (
                      <div className="unread-badge">
                        {unreadMap[conv._id]}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat area */}
      <div className={`chat-area ${!currentConv ? 'empty' : ''}`}>
        {currentConv ? (
          <>
            <div className="chat-header">
              {mobileView && (
                <button 
                  onClick={() => setShowConversations(true)}
                  className="back-button"
                >
                  <FiChevronLeft />
                </button>
              )}
              <div className="chat-title">
                {getFullName(currentConv.participants.find(p => p._id !== userId))}
              </div>
              <div className="chat-actions">
                <button className="notification-button">
                  <IoMdNotifications />
                </button>
              </div>
            </div>
            
            <div className="messages-container">
              {messages.map((msg, i) => (
                msg?.sender && (
                  <motion.div 
                    key={i}
                    className={`message ${isMyMessage(msg) ? 'sent' : 'received'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {!isMyMessage(msg) && (
                      <div className="message-sender">
                        {getFullName(msg.sender)}
                      </div>
                    )}
                    <div className="message-bubble">
                      {msg.text}
                    </div>
                   <div className="message-time">
        {new Date(msg.createdAt).toLocaleString([], {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>

                  </motion.div>
                )
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="message-input-container">
              <div className="message-input-wrapper">
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Écrivez un message…"
                  className="message-input"
                />
                <button 
                  onClick={handleSend} 
                  className="send-button"
                  disabled={!text.trim()}
                >
                  <FiSend />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-chat">
            <div className="empty-icon">
              <FiMessageSquare />
            </div>
            <h3>Start a conversation</h3>
            <p>Or choose a new conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messenger;

// CSS Styles
const styles = `
  :root {
    --primary-color: #ff3b3f;
    --secondary-color: #3f37c9;
    --accent-color: #4895ef;
    --light-color: #f8f9fa;
    --dark-color: #212529;
    --success-color: #4cc9f0;
    --warning-color: #f72585;
    --gray-color: #adb5bd;
    --light-gray: #e9ecef;
    --border-radius: 12px;
    --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    --transition: all 0.3s ease;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Segoe UI', 'Roboto', sans-serif;
    background-color: #f5f7fb;
    color: var(--dark-color);
  }

  .messenger-container {
    display: flex;
    height: 100vh;
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    box-shadow: var(--box-shadow);
    position: relative;
    overflow: hidden;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.5rem;
    color: var(--primary-color);
  }

  /* Sidebar styles */
  .sidebar {
    width: 300px;
    background: white;
    border-right: 1px solid var(--light-gray);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    z-index: 10;
  }

  .search-section, .conversations-section {
    padding: 1rem;
  }

  .search-section h3, .conversations-section h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: var(--dark-color);
    font-size: 1.1rem;
  }

  .search-input-container {
    display: flex;
    margin-bottom: 1rem;
    border: 1px solid var(--light-gray);
    border-radius: var(--border-radius);
    overflow: hidden;
    transition: var(--transition);
  }

  .search-input-container:focus-within {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(72, 149, 239, 0.2);
  }

  .search-input-container input {
    flex: 1;
    padding: 0.75rem;
    border: none;
    outline: none;
    font-size: 0.9rem;
  }

  .search-button {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 0 1rem;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .search-button:hover {
    background: var(--secondary-color);
  }

  .search-results {
    list-style: none;
    max-height: 300px;
    overflow-y: auto;
    margin-top: 0.5rem;
  }

  .search-results li {
    padding: 0.75rem;
    border-radius: var(--border-radius);
    margin-bottom: 0.5rem;
    background: var(--light-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--light-gray);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gray-color);
  }

  .user-details {
    flex: 1;
    overflow: hidden;
  }

  .user-name {
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-email {
    font-size: 0.75rem;
    color: var(--gray-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .message-button {
    background: none;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    font-size: 1.25rem;
    padding: 0.5rem;
    border-radius: 50%;
    transition: var(--transition);
  }

  .message-button:hover {
    background: rgba(67, 97, 238, 0.1);
  }

  .divider {
    height: 1px;
    background: var(--light-gray);
    margin: 0.5rem 1rem;
  }

  .conversations-list {
    overflow-y: auto;
    flex: 1;
  }

  .conversation-item {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    border-radius: var(--border-radius);
    margin-bottom: 0.5rem;
    cursor: pointer;
    gap: 0.75rem;
    position: relative;
  }

  .conversation-item:hover {
    background: var(--light-color);
  }

  .conversation-item.active {
    background: rgba(67, 97, 238, 0.1);
  }

  .conversation-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--light-gray);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gray-color);
    flex-shrink: 0;
  }

  .conversation-details {
    flex: 1;
    overflow: hidden;
  }

  .conversation-name {
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .conversation-preview {
    font-size: 0.8rem;
    color: var(--gray-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .unread-badge {
    background: var(--warning-color);
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: bold;
  }

  /* Chat area styles */
  .chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #f5f7fb;
    position: relative;
  }

  .chat-area.empty {
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
  }

  .chat-header {
    display: flex;
    align-items: center;
    padding: 1rem;
    background: white;
    border-bottom: 1px solid var(--light-gray);
    z-index: 5;
  }

  .back-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    margin-right: 0.5rem;
    cursor: pointer;
    color: var(--dark-color);
  }

  .chat-title {
    font-weight: 600;
    flex: 1;
  }

  .chat-actions {
    display: flex;
    gap: 0.5rem;
  }

  .notification-button {
    background: none;
    border: none;
    font-size: 1.25rem;
    color: var(--gray-color);
    cursor: pointer;
  }

  .messages-container {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .message {
    max-width: 70%;
    display: flex;
    flex-direction: column;
  }

  .message.sent {
    align-self: flex-end;
    align-items: flex-end;
  }

  .message.received {
    align-self: flex-start;
    align-items: flex-start;
  }

  .message-sender {
    font-size: 0.8rem;
    color: var(--gray-color);
    margin-bottom: 0.25rem;
  }

  .message-bubble {
    padding: 0.75rem 1rem;
    border-radius: var(--border-radius);
    position: relative;
    word-wrap: break-word;
  }

  .message.sent .message-bubble {
    background: var(--primary-color);
    color: white;
    border-bottom-right-radius: 0;
  }

  .message.received .message-bubble {
    background: white;
    color: var(--dark-color);
    border-bottom-left-radius: 0;
    box-shadow: var(--box-shadow);
  }

  .message-time {
    font-size: 0.7rem;
    color: var(--gray-color);
    margin-top: 0.25rem;
  }

  .message-input-container {
    padding: 1rem;
    background: white;
    border-top: 1px solid var(--light-gray);
  }

  .message-input-wrapper {
    display: flex;
    border: 1px solid var(--light-gray);
    border-radius: var(--border-radius);
    overflow: hidden;
    transition: var(--transition);
  }

  .message-input-wrapper:focus-within {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(72, 149, 239, 0.2);
  }

  .message-input {
    flex: 1;
    padding: 0.75rem;
    border: none;
    outline: none;
    font-size: 0.9rem;
  }

  .send-button {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 0 1.25rem;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .send-button:hover {
    background: var(--secondary-color);
  }

  .send-button:disabled {
    background: var(--gray-color);
    cursor: not-allowed;
  }

  .empty-chat {
    text-align: center;
    padding: 2rem;
  }

  .empty-icon {
    font-size: 3rem;
    color: var(--gray-color);
    margin-bottom: 1rem;
  }

  .empty-chat h3 {
    margin-bottom: 0.5rem;
    color: var(--dark-color);
  }

  .empty-chat p {
    color: var(--gray-color);
  }

  /* Responsive styles */
  @media (max-width: 768px) {
    .sidebar {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 100%;
      max-width: 300px;
    }

    .chat-area {
      width: 100%;
    }
  }
`;

// Add styles to the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);