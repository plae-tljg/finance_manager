import Dexie from 'dexie';

export const db = new Dexie('financeDB');

db.version(1).stores({
  transactions: '++id, date, amount, category, type, description',
  categories: '++id, name, type'
});

// 预设分类
const defaultCategories = [
  { name: '餐饮', type: 'expense' },
  { name: '交通', type: 'expense' },
  { name: '购物', type: 'expense' },
  { name: '工资', type: 'income' },
  { name: '投资', type: 'income' }
];

// 初始化分类
db.on('populate', async () => {
  await db.categories.bulkAdd(defaultCategories);
});