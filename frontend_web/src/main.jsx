import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { LocaleProvider } from './context/LocaleContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LocaleProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LocaleProvider>
  </StrictMode>,
)
