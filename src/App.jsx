import { useState } from 'react'
import { db } from './db/db'
import './App.css'
import FinanceManager from './components/FinanceManager'
import './styles/common.css'
function App() {
  const [importStatus, setImportStatus] = useState('')

  // 导出数据库功能
  const exportDB = async () => {
    try {
      const dbData = await db.exportDatabase()
      const blob = new Blob([JSON.stringify(dbData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      setImportStatus('导出成功！')
    } catch (error) {
      console.error('导出失败:', error)
      setImportStatus('导出失败：' + error.message)
    }
  }

  // 导入数据库功能
  const importDB = async (event) => {
    try {
      const file = event.target.files[0]
      if (!file) {
        setImportStatus('请选择文件')
        return
      }

      const text = await file.text()
      const data = JSON.parse(text)
      
      // 验证导入数据的格式
      if (!data.transactions || !data.categories) {
        throw new Error('无效的数据格式')
      }

      await db.restoreDatabase(data)
      setImportStatus('数据导入成功！')
      
      // 重置文件输入
      event.target.value = ''
      
      // 可选：刷新页面以显示新数据
      window.location.reload()
    } catch (error) {
      console.error('导入失败:', error)
      setImportStatus('导入失败：' + error.message)
    }
  }

  return (
    <div className="app">
      <h1>个人财务管理</h1>
      <FinanceManager />
      <div className="data-controls">
        <div className="import-export-buttons">
          <button onClick={exportDB} className="export-btn">
            导出数据
          </button>
          <label className="import-btn">
            导入数据
            <input
              type="file"
              accept=".json"
              onChange={importDB}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        {importStatus && (
          <div className={`status-message ${importStatus.includes('失败') ? 'error' : 'success'}`}>
            {importStatus}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
