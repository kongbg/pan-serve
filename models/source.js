import { DataTypes } from 'sequelize';
import { BaseModel, sequelize } from './BaseModel.js';

class Source extends BaseModel {}
// 建表sql
// CREATE TABLE `sources` (
//   `id` INT AUTO_INCREMENT PRIMARY KEY,
//   `title` VARCHAR(255),
//   `desc` VARCHAR(255),
//   `hot_score` VARCHAR(255),
//   `ranking` VARCHAR(255),
//   `src` VARCHAR(255),
//   `delFlag` INT DEFAULT 0,
//   `status` INT DEFAULT 1,
//   `createdAt` DATETIME NOT NULL,
//   `updatedAt` DATETIME NOT NULL
// );

Source.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: { // 标题
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: false,
    // unique: true // 避免重复创建
  },
  desc: { // 描述
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: true
  },
  hot_score: { // 热度评分
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  ranking: { // 排名
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  src: { // 图片地址
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: false
  },
  shares: { // 分享地址
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: true
  },
  old_shares: { // 旧分享地址
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: true
  },
  from: { // 来源
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: false
  },
  is_time: { // 临时资源 是-1 否-0
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_type: { // 网盘类型
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  source_category_id: { // 资源分类  1-短剧 2-电影 3-电视剧 4-动漫 5-综艺
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  delFlag: { // 删除-1 未删除-0
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: { // 状态: 1-未转存(缺titel,share) 2-已转存
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  sequelize,
  modelName: 'Source',
  tableName: 'sources',
  timestamps: true, // 自动 createAt, updateAt
});

// await Source.sync({ force: true }); // 将创建表,如果表已经存在,则将其首先删除
await Source.sync({ alter: true }); // 这将检查数据库中表的当前状态(它具有哪些列,它们的数据类型等),然后在表中进行必要的更改以使其与模型匹配.

export default Source;