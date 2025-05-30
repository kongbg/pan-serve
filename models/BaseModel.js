import { Model, Op } from 'sequelize';
import sequelize from '../db/index.js';

class BaseModel extends Model {
  // 通用的静态方法
  static async getAll(options = {}) {
    console.log({ where: { delFlag: 0 }, ...options })
    return this.findAll({ where: { delFlag: 0 }, ...options });
  }

  static async getById(id) {
    return this.findOne({ where: { id, delFlag: 0 } });
  }

  static async createOne(data) {
    return this.create({ ...data, delFlag: 0, status: 1 });
  }

  static async createAll(data) {
    return this.bulkCreate(data, {
      ignoreDuplicates: true, // 自动跳过重复项
      validate: true          // 保持数据验证
    });
  }

  static async updateById(id, updates) {
    await this.update({ ...updates }, { where: { id } });
    return this.getById(id);
  }

  static async updateAll(id, updates) {
    await this.update({ ...updates }, { where: { id } });
    // await this.bulkUpdate({ ...updates }, { where: { id } });
    return this.getById(id);
  }

  static async deleteById(id) {
    await this.update({ delFlag: 1 }, { where: { id } });
    return this.getById(id);
  }

  static async findWithQuery(query = {}) {
    // 这里可以根据 query 组装 Sequelize 的 where、order、limit、offset 等
    const { page, pageSize, sort, dateField, dateRange, ...where } = query;
    const options = { where: { ...where, delFlag: 0 } };
    if (sort) options.order = [[sort, 'ASC']];

    // 处理日期范围查询
    if (dateField && dateRange) {
      let startDate, endDate;
      
      switch (dateRange) {
        case 'today':
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          // 如果提供了具体的日期范围
          if (Array.isArray(dateRange) && dateRange.length === 2) {
            startDate = new Date(dateRange[0]);
            endDate = new Date(dateRange[1]);
            endDate.setHours(23, 59, 59, 999);
          }
      }
      if (startDate && endDate) {
        options.where[dateField] = {
          [Op.between]: [startDate, endDate]
        };
      }
    }
    if (page && pageSize) {
      options.limit = pageSize;
      options.offset = (page - 1) * pageSize;
    }
    return this.findAll(options);
  }
}

export { BaseModel, sequelize };