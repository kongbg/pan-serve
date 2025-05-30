import { Sequelize } from 'sequelize';
import { database, mysqlUser, mysqlPwd, mysqlHost, mysqlPort } from '../config/index.js'

// 请根据实际情况修改数据库配置
const sequelize = new Sequelize(database, mysqlUser, mysqlPwd, {
  host: mysqlHost,
  port: mysqlPort,
  dialect: 'mysql',
  logging: false,
  timezone: '+08:00',
});

export default sequelize;
