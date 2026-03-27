import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return new Date(date).toLocaleDateString();
}

export default function Chat() {
  const { userId: paramUserId } = useParams();
  const { user, socket } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUserId, setActiveUserId] = useState(paramUserId || null);
  const [activeUser, setActiveUser] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.get('/messages').then(r => setConversations(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeUserId) return;
    api.get(`/messages/${activeUserId}`).then(r => {
      setMessages(r.data);
      if (r.data.length > 0) {
        const other = r.data[0].sender._id === user.id ? r.data[0].receiver : r.data[0].sender;
        setActiveUser(other);
      }
    }).catch(() => {});
  }, [activeUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (msg.sender._id === activeUserId || msg.receiver._id === activeUserId) {
        setMessages(prev => [...prev, msg]);
      }
    };
    socket.on('message', handler);
    return () => socket.off('message', handler);
  }, [socket, activeUserId]);

  const send = async () => {
    if (!input.trim() || !activeUserId) return;
    try {
      const { data } = await api.post('/messages', { receiverId: activeUserId, content: input });
      setMessages(prev => [...prev, data]);
      setInput('');
    } catch { toast.error('Failed to send message'); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const getOtherUser = (conv) => {
    if (!conv.sender || !conv.receiver) return null;
    return conv.sender._id === user.id ? conv.receiver : conv.sender;
  };

  return (
    <div className="page" style={{paddingTop:'80px'}}>
      <div className="page-content" style={{paddingTop:'16px'}}>
        <div className="page-header">
          <div className="page-title">💬 Messages</div>
          <div className="page-subtitle">Secure communication with matched users</div>
        </div>
        <div className="chat-layout">
          {/* Sidebar */}
          <div className="chat-sidebar">
            <div style={{padding:'16px',borderBottom:'1px solid var(--border)',fontWeight:700,fontSize:'13px',color:'var(--text-secondary)'}}>CONVERSATIONS</div>
            {loading && <div style={{padding:'20px',textAlign:'center'}}><div className="spinner" style={{margin:'0 auto',width:'24px',height:'24px'}}/></div>}
            {conversations.length === 0 && !loading && (
              <div style={{padding:'24px',textAlign:'center',color:'var(--text-muted)',fontSize:'13px'}}>
                No conversations yet.<br />Start chatting from a notification!
              </div>
            )}
            {conversations.map(conv => {
              const other = getOtherUser(conv);
              if (!other) return null;
              return (
                <div key={conv._id} className={`conv-item${activeUserId === other._id?' active':''}`}
                  onClick={() => { setActiveUserId(other._id); setActiveUser(other); navigate(`/chat/${other._id}`); }}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'var(--brown-300)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:700,color:'white',flexShrink:0}}>
                      {other.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="conv-name">{other.name}</div>
                      <div className="conv-preview">{conv.content?.slice(0,40)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Main */}
          <div className="chat-main">
            {!activeUserId ? (
              <div style={{display:'flex',flex:1,alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'12px',color:'var(--text-muted)',padding:'40px'}}>
                <div style={{fontSize:'48px'}}>💬</div>
                <div style={{fontWeight:600,fontSize:'16px'}}>Select a conversation</div>
                <div style={{fontSize:'13px',textAlign:'center'}}>Conversations are created when items are matched</div>
              </div>
            ) : (
              <>
                <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:'12px'}}>
                  <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'var(--brown-400)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:700,color:'white'}}>
                    {activeUser?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{fontWeight:700}}>{activeUser?.name || 'User'}</div>
                    <div style={{fontSize:'12px',color:'var(--text-muted)'}}>{activeUser?.email}</div>
                  </div>
                </div>
                <div className="chat-messages">
                  {messages.length === 0 && (
                    <div style={{textAlign:'center',color:'var(--text-muted)',fontSize:'13px',margin:'auto'}}>Start the conversation!</div>
                  )}
                  {messages.map(msg => {
                    const isSent = msg.sender._id === user.id || msg.sender === user.id;
                    return (
                      <div key={msg._id} style={{display:'flex',flexDirection:'column',alignItems:isSent?'flex-end':'flex-start'}}>
                        <div className={`msg-bubble ${isSent?'msg-sent':'msg-recv'}`}>{msg.content}</div>
                        <div style={{fontSize:'10px',color:'var(--text-muted)',marginTop:'2px'}}>{timeAgo(msg.createdAt)}</div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <div className="chat-input-bar">
                  <input className="form-control" placeholder="Type a message..." value={input}
                    onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} />
                  <button onClick={send} className="btn btn-primary" disabled={!input.trim()}>Send →</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
