import BaseRoute from './BaseRoute.js';
import controller from '../controllers/source.js';

// 创建一个继承自 BaseRoute 的 Route 类
class Route extends BaseRoute {
  constructor() {
    // 调用父类构造函数，设置路由前缀和控制器
    super('/api/source', controller);

    // 导入资源
    this.addRoute('post', '/import', controller.import);
    // 转存+刮削
    this.addRoute('post', '/updateSource', controller.updateSource);
    // 详情
    this.addRoute('get', '/detail', controller.getById);
    // 从上游网站导入所有资源
    this.addRoute('post', '/importAll', controller.importAll);

    // 注册所有路由（先注册自定义路由，再注册 CRUD 路由）
    this.registerRoutes();
  }
}

// 创建并导出 Route 实例
export default new Route(); 