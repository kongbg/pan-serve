import { DataTypes } from 'sequelize';
import { BaseModel, sequelize } from './BaseModel.js';

class Task extends BaseModel {}

Task.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { // 标题
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: false
  },
  desc: { // 描述
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: true
  },
  type: { // 任务类型 1-转存+刮削
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  delFlag: { // 删除-1 未删除-0
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: { // 状态 1-未开始 2-进行中
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  sequelize,
  modelName: 'Task',
  tableName: 'tasks',
  timestamps: true, // 自动 createAt, updateAt
});

// await Task.sync({ force: true }); // 将创建表,如果表已经存在,则将其首先删除
await Task.sync({ alter: true }); // 这将检查数据库中表的当前状态(它具有哪些列,它们的数据类型等),然后在表中进行必要的更改以使其与模型匹配.

export default Task;