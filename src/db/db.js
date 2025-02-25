import Dexie from 'dexie';

export class FinanceDB extends Dexie {
  constructor() {
    super('financeDB');
    
    this.version(1).stores({
      transactions: '++id, date, amount, category, type, description',
      categories: '++id, name, type'
    });

    // 绑定自定义方法到数据库实例
    this.getMonthlyStats = this.getMonthlyStats.bind(this);
    this.getCategoryStats = this.getCategoryStats.bind(this);
    this.getDateRangeTransactions = this.getDateRangeTransactions.bind(this);
  }

  // 获取指定月份的统计数据
  async getMonthlyStats(year, month) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    const transactions = await this.transactions
      .where('date')
      .between(startDate.toISOString(), endDate.toISOString())
      .toArray();

    return {
      income: transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      expense: transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      transactionCount: transactions.length,
      categoryBreakdown: this.groupByCategory(transactions)
    };
  }

  // 获取分类统计
  async getCategoryStats(type, startDate, endDate) {
    const transactions = await this.transactions
      .where('date')
      .between(startDate.toISOString(), endDate.toISOString())
      .and(t => t.type === type)
      .toArray();

    return this.groupByCategory(transactions);
  }

  // 获取日期范围内的交易记录
  async getDateRangeTransactions(startDate, endDate, options = {}) {
    let query = this.transactions
      .where('date')
      .between(startDate.toISOString(), endDate.toISOString());

    // 应用过滤器
    if (options.type) {
      query = query.and(t => t.type === options.type);
    }
    if (options.category) {
      query = query.and(t => t.category === options.category);
    }
    if (options.minAmount) {
      query = query.and(t => t.amount >= options.minAmount);
    }
    if (options.maxAmount) {
      query = query.and(t => t.amount <= options.maxAmount);
    }

    // 应用排序
    const transactions = await query.toArray();
    if (options.sortBy) {
      transactions.sort((a, b) => {
        const direction = options.sortDirection === 'desc' ? -1 : 1;
        return direction * (a[options.sortBy] > b[options.sortBy] ? 1 : -1);
      });
    }

    return transactions;
  }

  // 批量导入交易记录
  async importTransactions(transactions) {
    return await this.transaction('rw', this.transactions, async () => {
      await this.transactions.bulkAdd(transactions);
    });
  }

  // 导出数据库
  async exportDatabase() {
    const [transactions, categories] = await Promise.all([
      this.transactions.toArray(),
      this.categories.toArray()
    ]);

    return {
      transactions,
      categories,
      metadata: {
        exportDate: new Date().toISOString(),
        version: this.verno
      }
    };
  }

  // 从备份恢复数据库
  async restoreDatabase(backup) {
    return await this.transaction('rw', [this.transactions, this.categories], async () => {
      // 清空现有数据
      await Promise.all([
        this.transactions.clear(),
        this.categories.clear()
      ]);

      // 恢复数据
      await Promise.all([
        this.transactions.bulkAdd(backup.transactions),
        this.categories.bulkAdd(backup.categories)
      ]);
    });
  }

  // 辅助方法：按分类分组
  groupByCategory(transactions) {
    return transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
  }
}

export const db = new FinanceDB();

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