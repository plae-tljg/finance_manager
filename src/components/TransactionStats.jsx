import React, { useMemo } from 'react'

function TransactionStats({ transactions }) {
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    return transactions.reduce((acc, transaction) => {
      const transDate = new Date(transaction.date)
      const isCurrentMonth = transDate.getMonth() === currentMonth && 
                           transDate.getFullYear() === currentYear
      
      if (isCurrentMonth) {
        if (transaction.type === 'income') {
          acc.monthlyIncome += transaction.amount
        } else {
          acc.monthlyExpense += transaction.amount
        }
      }

      if (transaction.type === 'income') {
        acc.totalIncome += transaction.amount
      } else {
        acc.totalExpense += transaction.amount
      }

      return acc
    }, {
      monthlyIncome: 0,
      monthlyExpense: 0,
      totalIncome: 0,
      totalExpense: 0
    })
  }, [transactions])

  return (
    <div className="transaction-stats">
      <div className="stats-card">
        <h4>本月收入</h4>
        <p className="income">¥{stats.monthlyIncome.toFixed(2)}</p>
      </div>
      <div className="stats-card">
        <h4>本月支出</h4>
        <p className="expense">¥{stats.monthlyExpense.toFixed(2)}</p>
      </div>
      <div className="stats-card">
        <h4>本月结余</h4>
        <p className={stats.monthlyIncome - stats.monthlyExpense >= 0 ? 'income' : 'expense'}>
          ¥{(stats.monthlyIncome - stats.monthlyExpense).toFixed(2)}
        </p>
      </div>
      <div className="stats-card">
        <h4>总收入</h4>
        <p className="income">¥{stats.totalIncome.toFixed(2)}</p>
      </div>
      <div className="stats-card">
        <h4>总支出</h4>
        <p className="expense">¥{stats.totalExpense.toFixed(2)}</p>
      </div>
      <div className="stats-card">
        <h4>总结余</h4>
        <p className={stats.totalIncome - stats.totalExpense >= 0 ? 'income' : 'expense'}>
          ¥{(stats.totalIncome - stats.totalExpense).toFixed(2)}
        </p>
      </div>
    </div>
  )
}

export default TransactionStats 