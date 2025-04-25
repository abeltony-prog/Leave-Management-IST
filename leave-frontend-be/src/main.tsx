import { createRoot } from 'react-dom/client'
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import { msalConfig } from './lib/msalConfig'
import App from './App.tsx'
import './index.css'

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig)

// Render the application wrapped with MSAL provider
createRoot(document.getElementById("root")!).render(
  <MsalProvider instance={msalInstance}>
    <App />
  </MsalProvider>
)
