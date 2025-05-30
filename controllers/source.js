import model from '../models/source.js';
import taskModel from '../models/task.js'
import BaseController from './BaseController.js';
import QuarkPlugin from '../plugins/QuarkPlugin.js';
import Task from '../models/task.js';

const quarkplugin = new QuarkPlugin();
class Controller extends BaseController {
    constructor() {
        // 调用父类构造函数，传入 model
        super(model);
    }

    // https://pan.quark.cn/s/262b0a676ab6
    // https://pan.quark.cn/s/e3bdda3ac846
    // https://pan.quark.cn/s/e5d20725d0dd
    // https://pan.quark.cn/s/8a58c864d641
    // https://pan.quark.cn/s/d4e4f76e4a2c
    // https://pan.quark.cn/s/0355a29eaa33
    // https://pan.quark.cn/s/a30f8943dc12
    // https://pan.quark.cn/s/b4051e3c4358
    // https://pan.quark.cn/s/4a10e947ea26
    // https://pan.quark.cn/s/403a4aa1094d
    // https://pan.quark.cn/s/fc19fd32892c
    // https://pan.quark.cn/s/441f2add7e32
    // https://pan.quark.cn/s/d1836f1568f8
    // https://pan.quark.cn/s/03bdb2b5b7d3
    // https://pan.quark.cn/s/07d064df0f55
    // https://pan.quark.cn/s/24ae8bc9c4bf
    // https://pan.quark.cn/s/74b5673ee77c
    // https://pan.quark.cn/s/8ce8e4712bfe

    /**
     * 通过url导入资源
     */
    async import(ctx) {
        const data = ctx.request.body;
        let urls = data.urls.split(';');
        let saveList = urls.map(url => {
            return {
                shares: url,
                delFlag: 0,
                status: 1
            }
        });
        await model.createAll(saveList); // 保存分享链接
        // 初始化任务
        let taskRes = await Task.findWithQuery({type: 1, delFlag: 0});
        if (!(taskRes && taskRes.length)) {
            await taskModel.create({
                name: '转存+刮削导入资源',
                desc: '转存+刮削导入资源',
                type: 1, // 转存+刮削
                status: 1, // 未开始
            })
        }

        // 立马开启刮削
        console.log('立马开启刮削')
        quarkplugin.updateSource();
        ctx.success({});
    }

    /**
     * 从上游网站导入所有资源
     */
    async importAll(ctx) {
        console.log('从上游网站导入所有资源')
        let res = await quarkplugin.importAll();
        console.log('从上游网站导入所有资源结束')
        if (res.code == 200) {
            ctx.success({});
        } else {
            ctx.error(res.msg)
        }
    }
 
    /**
     * 获取资源
     * @param {*} ctx 
     * @returns 
     */
    async ranking(ctx) {
        let query = ctx.request.query;
        let {channel} = query;
        let map = {
            '短剧': 1,
            '电影': 2,
            '电视剧': 3,
            '动漫': 4,
            '综艺': 5
        }
        let res = await model.findWithQuery({
            page: 1,
            pageSize: 24,
            sort: 'createdAt',
            source_category_id: map[channel]
        })
        ctx.success(res);
    }

    /**
     * 获取每日更新数据
     * @param {*} ctx 
     */
    async getDayRes(ctx) {
        let body = ctx.request.body;
        let { day=2, category_id=1 } = body; 
        // day 等2时 用于每日更新 否则，全部更新

        let params = {
            page: 1,
            pageSize: 10000
        }
        if (day == 2) {
            params = {
                dateField: 'createdAt',
                dateRange: 'today',
                source_category_id: category_id
            }
        } else {
            params = {
                source_category_id: category_id
            }
        }
        let res = await model.findWithQuery(params)
        ctx.success({
            total_result: res.length,
            items: res
        });
    }

    /**
     * 更新资源（转存，刮削），供定时任务使用
     * @param {*} ctx 
     */
    async updateSource(ctx) {
        let res = await quarkplugin.updateSource();
        ctx.success(res);
    }
    
    async transferAndShare(ctx) {
        let res = await quarkplugin.transferAndShare('https://pan.quark.cn/s/24ae8bc9c4bf');
        ctx.success(res);
    }

    async getSaveByTaskId(ctx) {
        let res = await quarkplugin.getSaveByTaskId('e0544750d250479f8fcd40a1cdfe27ee');
        ctx.success(res);
    }

    async transfer(ctx) {
        // let dirs = await quarkplugin.getFiles();


        // let res = await quarkplugin.transfer('https://pan.quark111.cn/s/8ce8e4712bfe');
        // if (res.code == 200) {
        //     let taskId = res.data.task_id;
        //     let res2 = await quarkplugin.getShareTask(taskId);
        //     let fids = res2.data.save_as.save_as_top_fids;

        //     if (res2.code == 200) {
        //         let res3 = await quarkplugin.getShareUrl(fids);
        //         console.log('res3:', res3)
        //     }
        // }
        

        // let res = await quarkplugin.getShareTask('6b8c09693d1b47dcb0b54612b1417aef');

        // console.log('getFileDateil')
        // let dirs = await quarkplugin.getFileDateil();

        // console.log('dirs:', dirs)


        // console.log(code, msg, data)
        // if (code == 200) {
        //     ctx.success(data);
        // } else {
        //     ctx.error(msg)
        // }

        // let res = await quarkplugin.getShareId(['f0c7b4bd067644e1b43e4af09633c4aa']);

        ctx.success(res);
    }
}

export default new Controller();