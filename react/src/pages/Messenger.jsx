import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3000');

const Messenger = () => {
  const [userId, setUserId]                 = useState(null);
  const [token, setToken]                   = useState(null);
  const [conversations, setConversations]   = useState([]);
  const [currentConv, setCurrentConv]       = useState(null);
  const [messages, setMessages]             = useState([]);
  const [text, setText]                     = useState('');
  const [search, setSearch]                 = useState('');
  const [searchResults, setSearchResults]   = useState([]);
  const [unreadMap, setUnreadMap]           = useState({}); // { convId: count }
  const [showConversations, setShowConversations] = useState(true);
  const userCacheRef = useRef({});

  // 1) Récupération du token + userId
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

  // 2) Charger les conversations et rejoindre leurs rooms
  useEffect(() => {
    if (!token) return;
    axios.get('http://localhost:3000/api/conversations', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setConversations(res.data);
      // Init compteur de non-lus et join de chaque room
      const map = {};
      res.data.forEach(conv => {
        map[conv._id] = 0;
        socket.emit('joinConversation', conv._id);
      });
      setUnreadMap(map);
    })
    .catch(console.error);
  }, [token]);

  // 3) Charger l’historique et reset compteur quand on ouvre
  useEffect(() => {
    if (!currentConv) return;
    // Reset badge pour cette conversation
    setUnreadMap(prev => ({ ...prev, [currentConv._id]: 0 }));
    // Charger les vieux messages
    axios.get(`http://localhost:3000/api/messages/${currentConv._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setMessages(res.data))
    .catch(console.error);
  }, [currentConv, token]);

  // 4) Réception des nouveaux messages
  useEffect(() => {
    const handler = (msg) => {
      // Si c’est la conversation ouverte, on ajoute directement
      if (currentConv && msg.conversation === currentConv._id) {
        setMessages(prev => [...prev, msg]);
      }
      // Sinon on incrémente le badge
      else if (msg.sender._id !== userId) {
        setUnreadMap(prev => ({
          ...prev,
          [msg.conversation]: (prev[msg.conversation] || 0) + 1
        }));
      }
    };
    socket.on('newMessage', handler);
    return () => { socket.off('newMessage', handler); };
  }, [currentConv, userId]);

  // 5) Recherche & création de conv (inchangé)
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
    try {
      const res = await axios.post(
        'http://localhost:3000/api/conversations',
        { senderId: userId, receiverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConversations(prev => [...prev, res.data]);
      // Join de la nouvelle room et init badge
      socket.emit('joinConversation', res.data._id);
      setUnreadMap(prev => ({ ...prev, [res.data._id]: 0 }));
      setCurrentConv(res.data);
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  // 6) Envoi du message (inchangé)
  const handleSend = async () => {
    if (!text.trim() || !currentConv) return;
    try {
      await axios.post('http://localhost:3000/api/messages',
        { conversationId: currentConv._id, text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setText('');
      // le controller backend émettra déjà le 'newMessage'
    } catch (err) {
      console.error(err);
    }
  };

  const isMyMessage = msg => msg.sender._id === userId;
  const getFullName = sender => 
    `${sender.firstName||sender.name||''} ${sender.lastName||sender.familyName||''}`.trim();

  if (!userId) return <div>Chargement…</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '25%', background: '#f0f2f5', padding: 20, borderRight: '1px solid #ddd' }}>
        <h3>🔍 Rechercher</h3>
        <div onMouseEnter={() => setShowConversations(false)} onMouseLeave={() => setShowConversations(true)}>
          <input
            type="text"
            placeholder="Nom ou email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 10 }}
          />
          <button onClick={handleSearch} style={{
            width: '100%', padding: 10, fontSize: 18,
            backgroundColor: '#007bff', color: '#fff', border: 'none',
            borderRadius: 10, cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#007bff'}>
            🔎
          </button>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: 10 }}>
            {searchResults.map(user => (
              <li key={user._id} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 'bold' }}>
                  {(user.firstName||user.name)+' '+(user.lastName||user.familyName||'')}
                </div>
                <div style={{ fontSize: 'small' }}>{user.email}</div>
                <button onClick={() => createConversation(user._id)} style={{ marginTop: 5 }}>
                  💬
                </button>
              </li>
            ))}
          </ul>
        </div>

        <hr style={{ margin: '20px 0' }} />
        <h3>📁 Conversations</h3>
        {showConversations && conversations.map(conv => (
          <div key={conv._id} onClick={() => setCurrentConv(conv)} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 10, marginBottom: 5,
            background: currentConv?._id===conv._id?'#d0e6ff':'#fff',
            borderRadius: 5, cursor: 'pointer', border: '1px solid #ccc'
          }}>
            <span>
              {getFullName(conv.participants.find(p=>p._id!==userId))}
            </span>
            {unreadMap[conv._id] > 0 && (
              <span style={{
                background: 'red',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: 12
              }}>
                {unreadMap[conv._id]}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Conversation */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentConv ? (
          <>
            <div style={{ flex:1, padding:20, overflowY:'auto', background:'#fafafa' }}>
              {messages.map((msg,i) => (
                <div key={i} style={{
                  marginBottom:10,
                  textAlign: isMyMessage(msg)?'right':'left'
                }}>
                  <div style={{ fontSize:'0.8rem', color:'#555', marginBottom:3 }}>
                    {getFullName(msg.sender)}
                  </div>
                  <span style={{
                    display:'inline-block', padding:'10px 15px',
                    background: isMyMessage(msg)?'#cef0ff':'#e0e0e0',
                    borderRadius:15, maxWidth:'60%'
                  }}>
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ padding:15, borderTop:'1px solid #ddd' }}>
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Message…"
                style={{
                  width:'80%', padding:10,
                  border:'1px solid #ccc', borderRadius:10,
                  marginRight:10
                }}
              />
              <button onClick={handleSend} style={{
                padding:'10px 20px', fontSize:18,
                backgroundColor:'#28a745', color:'#fff',
                border:'none', borderRadius:10, cursor:'pointer'
              }}>
                ✉️
              </button>
            </div>
          </>
        ) : (
          <div style={{
            flex:1, display:'flex', alignItems:'center',
            justifyContent:'center', color:'#999'
          }}>
            👈 Sélectionne une conversation
          </div>
        )}
      </div>
    </div>
  );
};

export default Messenger;
