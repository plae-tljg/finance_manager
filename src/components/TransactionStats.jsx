import { useMemo } from 'react'
import PropTypes from 'prop-types'
import '../styles/TransactionStats.css'

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
        <div className="stats-content">
          <span className="stats-label">本月收入</span>
          <span className="stats-value income">¥{stats.monthlyIncome.toFixed(2)}</span>
        </div>
      </div>
      <div className="stats-card">
        <div className="stats-content">
          <span className="stats-label">本月支出</span>
          <span className="stats-value expense">¥{stats.monthlyExpense.toFixed(2)}</span>
        </div>
      </div>
      <div className="stats-card">
        <div className="stats-content">
          <span className="stats-label">本月结余</span>
          <span className={`stats-value ${stats.monthlyIncome - stats.monthlyExpense >= 0 ? 'income' : 'expense'}`}>
            ¥{(stats.monthlyIncome - stats.monthlyExpense).toFixed(2)}
          </span>
        </div>
      </div>
      <div className="stats-card">
        <div className="stats-content">
          <span className="stats-label">总收入</span>
          <span className="stats-value income">¥{stats.totalIncome.toFixed(2)}</span>
        </div>
      </div>
      <div className="stats-card">
        <div className="stats-content">
          <span className="stats-label">总支出</span>
          <span className="stats-value expense">¥{stats.totalExpense.toFixed(2)}</span>
        </div>
      </div>
      <div className="stats-card">
        <div className="stats-content">
          <span className="stats-label">总结余</span>
          <span className={`stats-value ${stats.totalIncome - stats.totalExpense >= 0 ? 'income' : 'expense'}`}>
            ¥{(stats.totalIncome - stats.totalExpense).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}

TransactionStats.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['income', 'expense']).isRequired,
      amount: PropTypes.number.isRequired,
      category: PropTypes.string.isRequired
    })
  ).isRequired
}

export default TransactionStats 