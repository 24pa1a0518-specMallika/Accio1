import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" toastOptions={{
      style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' },
      success: { style: { background:'#d1fae5', color:'#065f46', border:'1px solid #6ee7b7' } },
      error: { style: { background:'#fee2e2', color:'#991b1b', border:'1px solid #fca5a5' } }
    }}/>
  </React.StrictMode>,
)
