import { useState } from 'react'
import { db } from '../db/db'
import PropTypes from 'prop-types'

function CategoryManager({ categories, onCategoriesUpdate }) {
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense' })
  const [isAdding, setIsAdding] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await db.categories.add(newCategory)
      setNewCategory({ name: '', type: 'expense' })
      setIsAdding(false)
      onCategoriesUpdate()
    } catch (error) {
      console.error('添加分类失败:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个分类吗？')) {
      try {
        await db.categories.delete(id)
        onCategoriesUpdate()
      } catch (error) {
        console.error('删除分类失败:', error)
      }
    }
  }

  return (
    <div className="category-manager">
      <h3>分类管理</h3>
      <button onClick={() => setIsAdding(!isAdding)}>
        {isAdding ? '取消' : '添加新分类'}
      </button>

      {isAdding && (
        <form onSubmit={handleSubmit} className="category-form">
          <input
            type="text"
            placeholder="分类名称"
            value={newCategory.name}
            onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
            required
          />
          <select
            value={newCategory.type}
            onChange={(e) => setNewCategory({...newCategory, type: e.target.value})}
          >
            <option value="expense">支出</option>
            <option value="income">收入</option>
          </select>
          <button type="submit">保存</button>
        </form>
      )}

      <div className="categories-list">
        <h4>支出分类</h4>
        <ul>
          {categories.filter(c => c.type === 'expense').map(category => (
            <li key={category.id}>
              {category.name}
              <button onClick={() => handleDelete(category.id)}>删除</button>
            </li>
          ))}
        </ul>

        <h4>收入分类</h4>
        <ul>
          {categories.filter(c => c.type === 'income').map(category => (
            <li key={category.id}>
              {category.name}
              <button onClick={() => handleDelete(category.id)}>删除</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

CategoryManager.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['expense', 'income']).isRequired
    })
  ).isRequired,
  onCategoriesUpdate: PropTypes.func.isRequired
}

export default CategoryManager 