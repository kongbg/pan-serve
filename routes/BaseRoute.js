import Router from 'koa-router';

/**
 * 基础路由类
 * 提供基本的 CRUD 操作，可以被其他路由继承
 */
class BaseRoute {
    /**
     * 构造函数
     * @param {string} prefix - 路由前缀
     * @param {object} controller - 控制器对象，包含 CRUD 方法
     */
    constructor(prefix = '', controller = null) {
        this.prefix = prefix;
        this.controller = controller;
        this.router = new Router({ prefix });
        this.customRoutes = []; // 存储自定义路由
    }

    /**
     * 添加自定义路由
     * @param {string} method - HTTP 方法 (get, post, put, delete 等)
     * @param {string} path - 路由路径
     * @param {function} handler - 路由处理函数
     * @returns {BaseRoute} - 返回 this 以支持链式调用
     */
    addRoute(method, path, handler) {
        // 存储自定义路由信息，但不立即注册
        this.customRoutes.push({ method, path, handler });
        return this;
    }

    /**
     * 注册所有路由（先注册自定义路由，再注册 CRUD 路由）
     * 在子类构造函数的最后调用此方法
     */
    registerRoutes() {
        // 1. 先注册所有自定义路由
        for (const route of this.customRoutes) {
            if (typeof this.router[route.method] === 'function') {
                // console.log(`Registering custom route: ${route.method.toUpperCase()} ${this.prefix}${route.path}`);
                this.router[route.method](route.path, route.handler);
            } else {
                console.error(`不支持的 HTTP 方法: ${route.method}`);
            }
        }

        // 2. 再注册 CRUD 路由
        if (this.controller) {
            this.registerCrudRoutes();
        }
    }

    /**
     * 注册基本的 CRUD 路由
     */
    registerCrudRoutes() {
        const { getAll, getById, create, update, delete: remove, addMany, find } = this.controller;

        // 只注册控制器中存在的方法对应的路由
        if (getAll) {
            this.router.get('/', getAll);
        }

        if (getById) {
            this.router.get('/:id', getById);
        }

        if (create) {
            this.router.post('/', create);
        }

        if (update) {
            this.router.put('/:id', update);
        }

        if (remove) {
            this.router.delete('/:id', remove);
        }

        if (addMany) {
            this.router.post('/addMany', addMany);
        }

        if (find) {
            this.router.post('/find', find);
        }
    }

    /**
     * 获取路由实例
     * @returns {Router} - Koa 路由实例
     */
    routes() {
        return this.router.routes();
    }

    /**
     * 获取路由允许的方法
     * @returns {function} - Koa 路由允许的方法中间件
     */
    allowedMethods() {
        return this.router.allowedMethods();
    }
}

export default BaseRoute; 