import { useState, useEffect } from 'react'
import { db } from '../db/db'
import TransactionStats from './TransactionStats'
import CategoryManager from './CategoryManager'
import TransactionCharts from './TransactionCharts'
import { Tabs, Tab, Box } from '@mui/material'
import '../styles/FinanceManager.css'

function FinanceManager() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [currentTab, setCurrentTab] = useState(0)
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    type: 'expense',
    description: ''
  })
  const [editingTransaction, setEditingTransaction] = useState(null)

  // 加载数据
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [transactionsData, categoriesData] = await Promise.all([
        db.transactions.toArray(),
        db.categories.toArray()
      ])
      setTransactions(transactionsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  // 添加新交易
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await db.transactions.add({
        ...newTransaction,
        amount: Number(newTransaction.amount)
      })
      setNewTransaction({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        type: 'expense',
        description: ''
      })
      await loadData()
    } catch (error) {
      console.error('添加交易失败:', error)
    }
  }

  // 删除交易记录
  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      try {
        await db.transactions.delete(id)
        await loadData()
      } catch (error) {
        console.error('删除失败:', error)
      }
    }
  }

  // 开始编辑交易记录
  const startEdit = (transaction) => {
    setEditingTransaction({
      ...transaction,
      date: transaction.date
    })
  }

  // 保存编辑后的交易记录
  const handleEdit = async (e) => {
    e.preventDefault()
    try {
      await db.transactions.update(editingTransaction.id, {
        ...editingTransaction,
        amount: Number(editingTransaction.amount)
      })
      setEditingTransaction(null)
      await loadData()
    } catch (error) {
      console.error('更新失败:', error)
    }
  }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
  }

  return (
    <div className="finance-manager">
      <h2>财务管理系统</h2>
      <TransactionStats transactions={transactions} />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="记录交易" />
          <Tab label="交易历史" />
          <Tab label="分类管理" />
          <Tab label="数据分析" />
        </Tabs>
      </Box>

      {/* 记录交易标签页 */}
      {currentTab === 0 && (
        <div>
          <h3>新增交易</h3>
          <form onSubmit={handleSubmit} className="transaction-form">
            <select
              value={newTransaction.type}
              onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
            >
              <option value="expense">支出</option>
              <option value="income">收入</option>
            </select>

            <input
              type="date"
              value={newTransaction.date}
              onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
            />

            <select
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
            >
              <option value="">选择分类</option>
              {categories
                .filter(cat => cat.type === newTransaction.type)
                .map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))
              }
            </select>

            <input
              type="number"
              placeholder="金额"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
            />

            <input
              type="text"
              placeholder="描述"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
            />

            <button type="submit">添加</button>
          </form>
        </div>
      )}

      {/* 交易历史标签页 */}
      {currentTab === 1 && (
        <div className="transactions-list">
          <h3>交易记录</h3>
          <table>
            <thead>
              <tr>
                <th>日期</th>
                <th>类型</th>
                <th>分类</th>
                <th>金额</th>
                <th>描述</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  {editingTransaction?.id === transaction.id ? (
                    <td colSpan="6">
                      <form onSubmit={handleEdit} className="edit-form">
                        <input
                          type="date"
                          value={editingTransaction.date}
                          onChange={(e) => setEditingTransaction({
                            ...editingTransaction,
                            date: e.target.value
                          })}
                        />
                        <select
                          value={editingTransaction.type}
                          onChange={(e) => setEditingTransaction({
                            ...editingTransaction,
                            type: e.target.value
                          })}
                        >
                          <option value="expense">支出</option>
                          <option value="income">收入</option>
                        </select>
                        <select
                          value={editingTransaction.category}
                          onChange={(e) => setEditingTransaction({
                            ...editingTransaction,
                            category: e.target.value
                          })}
                        >
                          {categories
                            .filter(cat => cat.type === editingTransaction.type)
                            .map(cat => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))
                          }
                        </select>
                        <input
                          type="number"
                          value={editingTransaction.amount}
                          onChange={(e) => setEditingTransaction({
                            ...editingTransaction,
                            amount: e.target.value
                          })}
                        />
                        <input
                          type="text"
                          value={editingTransaction.description}
                          onChange={(e) => setEditingTransaction({
                            ...editingTransaction,
                            description: e.target.value
                          })}
                        />
                        <button type="submit">保存</button>
                        <button type="button" onClick={() => setEditingTransaction(null)}>取消</button>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td>{transaction.date}</td>
                      <td>{transaction.type === 'expense' ? '支出' : '收入'}</td>
                      <td>{transaction.category}</td>
                      <td>{transaction.amount}</td>
                      <td>{transaction.description}</td>
                      <td>
                        <button onClick={() => startEdit(transaction)}>编辑</button>
                        <button onClick={() => handleDelete(transaction.id)}>删除</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 分类管理标签页 */}
      {currentTab === 2 && (
        <CategoryManager 
          categories={categories} 
          onCategoriesUpdate={loadData} 
        />
      )}

      {/* 数据分析标签页 */}
      {currentTab === 3 && (
        <TransactionCharts transactions={transactions} />
      )}
    </div>
  )
}

export default FinanceManager 