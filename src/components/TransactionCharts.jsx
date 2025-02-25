import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import PropTypes from 'prop-types'
import '../styles/TransactionCharts.css'

function TransactionCharts({ transactions }) {
  const monthlyChartRef = useRef(null)
  const categoryChartRef = useRef(null)
  
  const monthlyChartInstance = useRef(null)
  const categoryChartInstance = useRef(null)

  useEffect(() => {
    const prepareMonthlyData = () => {
      const last6Months = Array.from({length: 6}, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        return date
      }).reverse()

      const monthlyData = last6Months.map(date => {
        const month = date.getMonth()
        const year = date.getFullYear()
        const monthTransactions = transactions.filter(t => {
          const tDate = new Date(t.date)
          return tDate.getMonth() === month && tDate.getFullYear() === year
        })

        return {
          month: `${year}-${String(month + 1).padStart(2, '0')}`,
          income: monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0),
          expense: monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)
        }
      })

      return monthlyData
    }

    const prepareCategoryData = () => {
      const categoryExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount
          return acc
        }, {})

      return {
        labels: Object.keys(categoryExpenses),
        data: Object.values(categoryExpenses)
      }
    }

    // 月度收支趋势图
    const monthlyData = prepareMonthlyData()
    if (monthlyChartInstance.current) monthlyChartInstance.current.destroy()
    monthlyChartInstance.current = new Chart(monthlyChartRef.current, {
      type: 'line',
      data: {
        labels: monthlyData.map(d => d.month),
        datasets: [
          {
            label: '收入',
            data: monthlyData.map(d => d.income),
            borderColor: '#4CAF50',
            tension: 0.1
          },
          {
            label: '支出',
            data: monthlyData.map(d => d.expense),
            borderColor: '#f44336',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '月度收支趋势'
          }
        }
      }
    })

    // 支出分类饼图
    const categoryData = prepareCategoryData()
    if (categoryChartInstance.current) categoryChartInstance.current.destroy()
    categoryChartInstance.current = new Chart(categoryChartRef.current, {
      type: 'pie',
      data: {
        labels: categoryData.labels,
        datasets: [{
          data: categoryData.data,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '支出分类占比'
          }
        }
      }
    })

    return () => {
      if (monthlyChartInstance.current) monthlyChartInstance.current.destroy()
      if (categoryChartInstance.current) categoryChartInstance.current.destroy()
    }
  }, [transactions])

  return (
    <div className="transaction-charts">
      <div className="chart-container">
        <canvas ref={monthlyChartRef}></canvas>
      </div>
      <div className="chart-container">
        <canvas ref={categoryChartRef}></canvas>
      </div>
    </div>
  )
}

TransactionCharts.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['income', 'expense']).isRequired,
      amount: PropTypes.number.isRequired,
      category: PropTypes.string.isRequired
    })
  ).isRequired
}

export default TransactionCharts 