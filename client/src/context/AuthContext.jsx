import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('accio_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const s = io('http://localhost:5000', { query: { userId: user.id } });
      setSocket(s);
      s.on('notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(c => c + 1);
      });
      // Load notifications
      api.get('/notifications').then(r => {
        setNotifications(r.data);
        setUnreadCount(r.data.filter(n => !n.isRead).length);
      }).catch(() => {});
      return () => s.disconnect();
    }
  }, [user]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accio_token', data.token);
    localStorage.setItem('accio_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, adminCode) => {
    const { data } = await api.post('/auth/register', { name, email, password, adminCode });
    localStorage.setItem('accio_token', data.token);
    localStorage.setItem('accio_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('accio_token');
    localStorage.removeItem('accio_user');
    setUser(null);
    if (socket) socket.disconnect();
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, socket, notifications, setNotifications, unreadCount, setUnreadCount, markAllRead }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
