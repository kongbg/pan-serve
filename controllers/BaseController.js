/**
 * 基础控制器类
 * 提供基本的 CRUD 操作，可以被其他控制器继承
 */
class BaseController {
    /**
     * 构造函数
     * @param {object} model - 数据模型对象，包含 CRUD 方法
     */
    constructor(model = null) {
        this.model = model;
    }

    /**
     * 获取所有资源
     * @param {object} ctx - Koa 上下文
     */
    getAll = async (ctx) => {
        try {
            if (!this.model || !this.model.getAll) {
                throw new Error('Model does not implement getAll method');
            }

            const items = await this.model.getAll() || [];
            ctx.success(items);
        } catch (error) {
            ctx.error(error.message);
        }
    };

    /**
     * 根据 ID 获取资源
     * @param {object} ctx - Koa 上下文
     */
    getById = async (ctx) => {
        try {
            if (!this.model || !this.model.getById) {
                throw new Error('Model does not implement getById method');
            }

            const id = ctx.params.id || ctx.query.id;
            const item = await this.model.getById(id) || null;

            if (!item) {
                ctx.error('资源不存在');
                return;
            }

            ctx.success(item);
        } catch (error) {
            ctx.error(error.message);
        }
    };

    /**
     * 创建资源
     * @param {object} ctx - Koa 上下文
     */
    create = async (ctx) => {
        try {
            if (!this.model || !this.model.createOne) {
                throw new Error('Model does not implement createOne method');
            }

            const data = ctx.request.body;

            // 可以在子类中重写此方法以添加验证逻辑
            const validationError = this.validateCreate(data);
            if (validationError) {
                ctx.error(validationError);
                return;
            }

            const newItem = await this.model.createOne(data);
            ctx.success(newItem);
        } catch (error) {
            ctx.error(error.message);
        }
    };

    /**
     * 更新资源
     * @param {object} ctx - Koa 上下文
     */
    update = async (ctx) => {
        try {
            if (!this.model || !this.model.update) {
                throw new Error('Model does not implement update method');
            }

            const id = ctx.params.id;
            const updates = ctx.request.body;

            // 可以在子类中重写此方法以添加验证逻辑
            const validationError = this.validateUpdate(updates);
            if (validationError) {
                ctx.error(validationError);
                return;
            }

            const updatedItem = await this.model.update(id, updates);

            if (!updatedItem) {
                ctx.error('资源不存在2');
                return;
            }

            ctx.success(updatedItem);
        } catch (error) {
            ctx.error(error.message);
        }
    };

    /**
     * 删除资源
     * @param {object} ctx - Koa 上下文
     */
    delete = async (ctx) => {
        try {
            if (!this.model || !this.model.delete) {
                throw new Error('Model does not implement delete method');
            }

            const id = ctx.params.id;
            const result = await this.model.delete(id);

            if (!result) {
                ctx.error('资源不存在3');
                return;
            }

            ctx.success('删除成功');
        } catch (error) {
            ctx.error(error.message);
        }
    };

    /**
     * 批量添加资源
     * @param {object} ctx - Koa 上下文
     */
    addMany = async (ctx) => {
        try {
            if (!this.model || !this.model.addMany) {
                throw new Error('Model does not implement addMany method');
            }

            const data = ctx.request.body;
            const newItems = await this.model.addMany(data);
            ctx.success(newItems);
        } catch (error) {
            ctx.error(error.message);
        }
    }

    /** 
     * 根据条件查询资源
     * @param {object} ctx - Koa 上下文
     */
    find = async (ctx) => {
        try {
            if (!this.model || !this.model.find) {
                throw new Error('Model does not implement find method');
            }

            const data = ctx.request.body;
            const items = await this.model.find(data);
            ctx.success(items);
        } catch (error) {
            ctx.error(error.message);
        }
    }

    /**
     * 验证创建资源的数据
     * 子类可以重写此方法以添加自定义验证逻辑
     * @param {object} data - 要验证的数据
     * @returns {string|null} - 验证错误消息，如果没有错误则返回 null
     */
    validateCreate(data) {
        return null;
    }

    /**
     * 验证更新资源的数据
     * 子类可以重写此方法以添加自定义验证逻辑
     * @param {object} data - 要验证的数据
     * @returns {string|null} - 验证错误消息，如果没有错误则返回 null
     */
    validateUpdate(data) {
        return null;
    }
}

export default BaseController; 