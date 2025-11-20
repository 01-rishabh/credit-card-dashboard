import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import StatementAnalyzer from './Dashboard/Dashboard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <StatementAnalyzer />
    </>
  )
}

export default App
