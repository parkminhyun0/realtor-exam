import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import './typography-responsive.css'
import './law-viewer.css'
import './registration-law-highlights.js'
import './tax-law-nav-tree.js'
import './tax-law-exam-drill.css'
import './table-layout.css'
import './mobile-table-scroll-fix.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
