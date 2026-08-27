import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import './typography-responsive.css'
import './law-viewer.css'
import './registration-law-highlights.js'
import './registration-law-decree-popup.js'
import './tax-law-nav-tree.js'
import './tax-law-exam-drill.css'
import './table-layout.css'
import './mobile-table-scroll-fix.css'
import './mobile-table-viewport.js'
import './exam-wording-standard.js'
import './civil-law-part1-law-first.css'
import './civil-law-part1-law-first.js'
import './civil-law-part2-law-first.js'
import './civil-law-part3-law-first.js'
import './civil-law-part4-law-first.js'
import './civil-law-precision-layer.js'
import './subject-ui-unified.css'
import './text-overlap-guard.css'
import './text-label-layout-fix.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
