import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { db } from './db/db'
import './App.css'
import FinanceManager from './components/FinanceManager'

function App() {
  const [count, setCount] = useState(0)

  // 添加导出数据库功能
  const exportDB = async () => {
    try {
      const transactions = await db.transactions.toArray()
      const categories = await db.categories.toArray()
      const dbData = {
        transactions,
        categories,
        exportDate: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(dbData)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出失败:', error)
    }
  }

  // 添加导入数据库功能
  const importDB = async (event) => {
    try {
      const file = event.target.files[0]
      const text = await file.text()
      const data = JSON.parse(text)
      
      await db.transactions.clear()
      await db.categories.clear()
      
      if (data.transactions?.length) {
        await db.transactions.bulkAdd(data.transactions)
      }
      if (data.categories?.length) {
        await db.categories.bulkAdd(data.categories)
      }
      
      alert('数据导入成功！')
    } catch (error) {
      console.error('导入失败:', error)
      alert('导入失败，请确保文件格式正确')
    }
  }

  return (
    <div className="app">
      <h1>个人财务管理</h1>
      <FinanceManager />
      <div className="data-controls">
        <button onClick={exportDB}>导出数据库</button>
        <input
          type="file"
          accept=".json"
          onChange={importDB}
          style={{ margin: '10px 0' }}
        />
      </div>
    </div>
  )
}

export default App
