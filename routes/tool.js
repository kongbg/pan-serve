import BaseRoute from './BaseRoute.js';
import controller from '../controllers/source.js';

// 创建一个继承自 BaseRoute 的 Route 类
class Route extends BaseRoute {
  constructor() {
    // 调用父类构造函数，设置路由前缀和控制器
    super('/api/tool', controller);

    // 搜索资源
    this.addRoute('get', '/ranking', controller.ranking);

    // 注册所有路由（先注册自定义路由，再注册 CRUD 路由）
    this.registerRoutes();
  }
}

// 创建并导出 Route 实例
export default new Route(); 