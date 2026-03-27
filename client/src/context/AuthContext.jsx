import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { io } from 'socket.io-client';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

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
    try {
      // Firebase Login
      console.log('Attempting Firebase login...');
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase login successful');
      
      // Backend Sync
      console.log('Syncing with backend...');
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accio_token', data.token);
      localStorage.setItem('accio_user', JSON.stringify(data.user));
      setUser(data.user);
      console.log('Backend sync successful');
      return data.user;
    } catch (err) {
      console.error('Login Error:', err);
      // Construct a better error message
      if (err.code === 'auth/user-not-found') throw new Error('No account found with this email');
      if (err.code === 'auth/wrong-password') throw new Error('Incorrect password');
      if (err.code === 'auth/invalid-email') throw new Error('Invalid email format');
      if (err.response?.data?.message) throw new Error(err.response.data.message);
      throw err;
    }
  };

  const register = async (name, email, password, adminCode) => {
    try {
      // Firebase Register
      console.log('Attempting Firebase registration...');
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase registration successful');

      // Backend Sync
      console.log('Syncing with backend...');
      const { data } = await api.post('/auth/register', { name, email, password, adminCode });
      localStorage.setItem('accio_token', data.token);
      localStorage.setItem('accio_user', JSON.stringify(data.user));
      setUser(data.user);
      console.log('Backend sync successful');
      return data.user;
    } catch (err) {
      console.error('Registration Error:', err);
      if (err.code === 'auth/email-already-in-use') throw new Error('Email is already in use in Firebase');
      if (err.code === 'auth/weak-password') throw new Error('Password should be at least 6 characters');
      if (err.response?.data?.message) throw new Error(err.response.data.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('accio_token');
    localStorage.removeItem('accio_user');
    // Clear any potential hanging firebase session
    auth.signOut().catch(() => {});
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
