import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './config/i18n.js'
import { getPersistedLanguage } from './config/language.js'
import './styles/global.css'
import './styles/clay.css'

const savedLanguage = getPersistedLanguage();
document.documentElement.lang = savedLanguage;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
