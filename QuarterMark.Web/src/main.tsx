import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryProvider } from './providers/QueryProvider'
import App from './App'
import './i18n/config'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </React.StrictMode>,
)

