import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // Import our global styles and Tailwind

// This is the entry point for the React application
// ReactDOM.createRoot finds the <div id="root"> in index.html
// and renders our main <App /> component inside it.
ReactDOM.createRoot(document.getElementById('root')).render(
    // StrictMode helps find potential problems in an application by running checks and warnings
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
