import schedule from 'node-schedule';
import QuarkPlugin from '../plugins/QuarkPlugin.js';
const quarkPlugin = new QuarkPlugin();
console.log('定时任务已开启');

// * * * * * 每分钟执行
// 0 * * * * 每小时执行
// 0 0 * * * 每天零点执行
// 0 0 1 * * ? 每天凌晨1点执行
// 0 0 0 * * 每月 1 号零点执行
// 0 0 0 0 * 每年 1 月 1 号零点执行


// 0 0 * * * 每天零点执行
// 第1位0：秒数为0
// 第2位0：分钟为0
// 第3位1：小时为1（凌晨1点）
// 后三位* * ?：每日每月不限制，周几不指定


// 每分钟的第0秒执行（测试用）
// schedule.scheduleJob('* * * * *', async () => {
//   try {
//     console.log('每分钟的第0秒执行')
//     // quarkPlugin.updateSource(); // 测试
//     // quarkPlugin.updateTodaySource({day: 2, category_id: 1}); // 测试
//   } catch (error) {
//     console.error('每分钟任务执行失败:', error);
//   }
// });

// 每小时执行一次
// schedule.scheduleJob('0 * * * *', async () => {
//   try {
//   } catch (error) {
//     console.error('每小时任务执行失败:', error);
//   }
// }); 

//  每天零点执行一次
schedule.scheduleJob('0 0 * * *', async () => {
  try {
    // 从上游网站更新资源
    // quarkPlugin.updateTodaySource({day: 2, category_id: 1}); // 更新短剧
    // quarkPlugin.updateTodaySource({day: 2, category_id: 2}); // 更新电影
    // quarkPlugin.updateTodaySource({day: 2, category_id: 3}); // 更新电视剧
    // quarkPlugin.updateTodaySource({day: 2, category_id: 4}); // 更新动漫
    // quarkPlugin.updateTodaySource({day: 2, category_id: 5}); // 更新综艺
  } catch (error) {
    console.error('每天零点任务执行失败:', error);
  }
}); 

//  每天凌晨1点执行一次
schedule.scheduleJob('0 0 1 * * ?', async () => {
  try {
    // 转存+刮削title
    // quarkPlugin.updateSource();
  } catch (error) {
    console.error('每天零点任务执行失败:', error);
  }
}); 