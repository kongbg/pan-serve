import fetch from 'node-fetch';
import axios from 'axios'
import Source from '../models/source.js';
import Task from '../models/task.js';
import { cookie } from '../config/index.js'

class QuarkPlugin {
    constructor() {
        this.url = "https://www.ddb8.net";
        this.source_category_id = 0;
        this.quark_cookie = cookie;
        this.header = {
            "accept": "application/json, text/plain, */*",
            "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Google Chrome\";v=\"137\", \"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "cookie": "",
            "Referer": "https://pan.quark.cn/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }
    }


    /**
     * 获取当前用户网盘目录
     * @returns 
     */
    async getFiles() {
        const params = {
            'pr': 'ucpro',
            'fr': 'pc',
            'uc_param_str': '',
            'pdir_fid': 0,
            '_page': 1,
            '_size': 50,
            '_fetch_total': 1,
            '_fetch_sub_dirs': 0,
            '_sort': 'file_type:asc,updated_at:desc',
        };
        const res = await this.handleFetch('https://drive-pc.quark.cn/1/clouddrive/file/sort', 'get', params)
        return res.data;
    }

    /**
     * 转存他人资源 todo: 指定保存目录
     * @param {*} url 
     * @returns 
     */
    async transfer(url, fid) {
        // 夸克网盘
        if (this.getPanType(url) == 'quark'){
            let pwd_id = this.getUrlParam(url, '/s/');
            console.log('pwd_id:', pwd_id)
            let stoken = await this.getStoken(pwd_id);
            fid = '89a09dee2c114a648046fcc1b7e00801';

            let params = {
                "fid_list": [],
                "fid_token_list": [],
                "to_pdir_fid": fid, // 保存目录 通过 getFiles 接口，通过file_name字段找到 fid 
                "pwd_id": pwd_id,
                "stoken": stoken,
                "pdir_fid": "0",
                "pdir_save_all": true,
                "exclude_fids": [],
                "scene": "link"
            }
            // console.log('params:', params)
            let { status, code, data, message } = await this.handleFetch("https://drive-pc.quark.cn/1/clouddrive/share/sharepage/save?pr=ucpro&fr=pc&uc_param_str=", 'post', params);
            
            if (status == 200 && code == 0) {
                return {
                    code: 200,
                    msg: '转存成功！',
                    data: data
                }
            } else {
                return {
                    code: 400,
                    msg: message,
                    data: data
                }
            }
            
            // res = {
            //     "status": 200,
            //     "code": 0,
            //     "message": "ok",
            //     "timestamp": 1748422238,
            //     "data": {
            //         "task_id": "6b8c09693d1b47dcb0b54612b1417aef"
            //     },
            //     "metadata": {
            //         "tq_gap": 500
            //     }
            // }
        } else {
            return {
                code: 400,
                msg: '当前只支持夸克网盘',
                data: null
            }
        }
    }

    /**
     * 链接直接保存，不转存
     * @param {*} allData 
     * @param {*} source_category_id 
     */
    async import() {
        
    }

    /**
     * 从上游网站导入所有资源
     */
    async importAll() {
        let that = this
        let total = 0;
        let pages = 0;
        let params = {
            page_no: 1,
            page_size: 10000,
            category_id: 1,
            day: 1
        }

        await getData();

        async function getData() {
            let res = await axios.post('https://www.ddb8.net/api/search', params);
            let items = []
            
            if (res.data.code == 200) {
                total = res.data.data.total_result;
                pages = Math.ceil(total/params.page_size);
                console.log(`总共${total}条，共${pages}页，当前第${params.page_no}页, ${res.data.data.items.length}条`)
                items = res.data.data.items.map(item=>{
                    return {
                        "title": item.title,
                        "desc": item.name,
                        "hot_score": 0,
                        "ranking": 0,
                        "src": "",
                        "shares": item.url,
                        "old_shares": "",
                        "from": "",
                        "is_time": item.is_time,
                        "is_type": item.is_type,
                        "source_category_id": item.source_category_id,
                        "delFlag": 0,
                        "status": 1,
                        "createdAt": item.times
                    }
                })

                await Source.createAll(items);
                console.log(`${items.length}条保存成功，等待10s`)

                await that.sleep(10000);
                params.page_no++;
                if(params.page_no <= pages) {
                    return await getData();
                } else {
                    return {
                        code: 200,
                        data: null,
                        msg: '全部保存成功'
                    }
                }
            } else {
                console.log('获取失败')
                return {
                    code: 400,
                    data: null,
                    msg: '获取失败'
                }
            }
        }
    }

    /**
     * 转存并且获取分享链接
     */
    async transferAndShare(url, fid) {
        let res = await this.transfer(url, fid);
        if (res.code == 200) {
            let taskId = res.data.task_id;
            console.log('转存成功，任务id：', taskId)

            await this.sleep(1000);

            let res2 = await this.getSaveInfoByTaskId(taskId);
            let fids = res2.data.save_as.save_as_top_fids;
            console.log('转存信息，文件id：', fids)

            if (res2.code == 200) {
                await this.sleep(1000);
                let res3 = await this.getShareTaskId(fids);
                if (res3.code == 200) {
                    let shareTaskId = res3.data.task_id;
                    console.log('分享成功，shareTaskId：', shareTaskId)

                    await this.sleep(1000);
                    let res4 = await this.getShareInfoByTaskId(shareTaskId);
                    if (res4.code == 200) {
                        let shareId = res4.data.share_id;
                        console.log('分享成功，shareId：', shareId)

                        await this.sleep(1000);
                        let res5 = await this.getShareUrl(shareId);
                        if (res5.code == 200) {
                            console.log('分享成功，share_url：', res5.data.share_url);
                            return res5;
                        }
                    }
                }
            }
        }

        // console.timeEnd('transferAndShare')
    }

    /**
     * 通过taskId获取转存资源信息，为了拿到fid,获取分享链接需要用到fid
     */
    async getSaveInfoByTaskId(taskId) {
        let params = {
            "pr": "ucpro",
            "fr": "pc",
            "uc_param_str": "",
            "task_id": taskId,
        }
        let { status, code, data, message } = await this.handleFetch("https://drive-pc.quark.cn/1/clouddrive/task", 'get', params);
        // console.log(status, code, data, message)
        if (status == 200 && code == 0) {
            return {
                code: 200,
                msg: '获取成功！',
                data: data
            }
        } else {
            return {
                code: 400,
                msg: message,
                data: null
            }
        }

        // {
        //     task_id: '6b8c09693d1b47dcb0b54612b1417aef',
        //     event_id: '97y0cg-263a816a9f67aa',
        //     task_type: 17,
        //     task_title: '分享-转存',
        //     status: 2,
        //     created_at: 1748422234454,
        //     finished_at: 1748422238492,
        //     share: { meaning_link: true },
        //     save_as: {
        //       search_exit: true,
        //       save_as_select_top_fids: [],
        //       remain_capacity: 16439215804022,
        //       to_pdir_fid: '89a09dee2c114a648046fcc1b7e00801',
        //       save_as_sum_num: 1,
        //       is_pack: '0',
        //       save_as_top_fids: [ 'f0c7b4bd067644e1b43e4af09633c4aa' ],
        //       to_pdir_name: '测试',
        //       min_save_file_size: 522
        //     }
        // }
    }

    /**
     * 获取分享taskId
     */
    async getShareTaskId(fids=[]) {
        let params = {
            "fid_list": fids,
            "title": "怀孕大作战【PC】.txt",
            "url_type": 1,
            "expired_type": 1
        }
        let { status, code, data, message } = await this.handleFetch("https://drive-pc.quark.cn/1/clouddrive/share?pr=ucpro&fr=pc&uc_param_str=", 'post', params)
        if (status == 200 && code == 0) {
            return {
                code: 200,
                msg: '获取成功！',
                data: data
            }
        } else {
            return {
                code: 400,
                msg: message,
                data: null
            }
        }

        // {
        //     "status": 200,
        //     "code": 0,
        //     "message": "ok",
        //     "timestamp": 1748427980,
        //     "data": {
        //         "task_id": "cafd4a5d933746638e25b07c607736ae",
        //         "task_sync": true,
        //         "task_resp": {
        //             "status": 200,
        //             "code": 0,
        //             "message": "ok",
        //             "timestamp": 1748427980,
        //             "data": {
        //                 "task_id": "cafd4a5d933746638e25b07c607736ae",
        //                 "event_id": "99fhfa-263aad4175d107",
        //                 "task_type": 8,
        //                 "task_title": "分享",
        //                 "status": 2,
        //                 "created_at": 1748427980532,
        //                 "finished_at": 1748427980571,
        //                 "share_id": "5549e71c461449cbaad077c0a61335e5",
        //                 "share": {
        //                     "meaning_link": true
        //                 },
        //                 "save_as": {
        //                     "save_as_select_top_fids": [],
        //                     "is_pack": "0",
        //                     "save_as_top_fids": []
        //                 },
        //                 "creation_snapshot": {
        //                     "success_count": 1,
        //                     "failed_count": 0
        //                 }
        //             },
        //             "metadata": {}
        //         }
        //     },
        //     "metadata": {
        //         "tq_gap": 100
        //     }
        // }
    }

    /**
     * 通过shareTaskId获取分享文件详情
     * @param {*} taskId 
     */
    async getShareInfoByTaskId(task_id, retry_index=0) {
          let params = {
            pr: 'ucpro',
            fr: 'pc',
            uc_param_str: '',
            task_id,
            retry_index
          }
          let { status, code, data, message } = await this.handleFetch("https://drive-pc.quark.cn/1/clouddrive/task", 'get', params)
          if (status == 200 && code == 0) {
              return {
                  code: 200,
                  msg: '获取成功！',
                  data: data
              }
          } else {
              return {
                  code: 400,
                  msg: message,
                  data: null
              }
          }

        //   {
        //     "status": 200,
        //     "code": 0,
        //     "message": "ok",
        //     "timestamp": 1748438604,
        //     "data": {
        //         "task_id": "d220c74cf72344d99aee99f27c9e505d",
        //         "event_id": "99f9q8-263afe4fdc8be5",
        //         "task_type": 8,
        //         "task_title": "分享",
        //         "status": 2,
        //         "created_at": 1748438604740,
        //         "finished_at": 1748438604789,
        //         "share_id": "e19cf1f2070f4ea391dbc409e9f4c654",
        //         "share": {
        //             "expired_timestamp": 1748525004740,
        //             "meaning_link": true
        //         },
        //         "save_as": {
        //             "save_as_select_top_fids": [],
        //             "is_pack": "0",
        //             "save_as_top_fids": []
        //         },
        //         "creation_snapshot": {
        //             "success_count": 1,
        //             "failed_count": 0
        //         }
        //     },
        //     "metadata": {
        //         "tq_gap": 500
        //     }
        // }

    }

    /**
     * 通过shareId获取分享链接
     * @param {*} id
     */
    async getShareUrl(share_id) {
        let params = {
            share_id
        }
        let { status, code, data, message } = await this.handleFetch("https://drive-pc.quark.cn/1/clouddrive/share/password?pr=ucpro&fr=pc&uc_param_str=", 'post', params)
        if (status == 200 && code == 0) {
            return {
                code: 200,
                msg: '获取成功！',
                data: data
            }
        } else {
            return {
                code: 400,
                msg: message,
                data: null
            }
        }

        // {
        //     "status": 200,
        //     "code": 0,
        //     "message": "ok",
        //     "timestamp": 1748427980,
        //     "data": {
        //         "title": "怀孕大作战【PC】.txt",
        //         "sub_title": "我用网盘给你分享文件，赶快查收吧。",
        //         "share_type": 0,
        //         "pwd_id": "3eda917d0908",
        //         "share_url": "https://pan.quark.cn/s/3eda917d0908",
        //         "url_type": 1,
        //         "expired_type": 1,
        //         "file_num": 1,
        //         "expired_at": 4102416000000,
        //         "first_file": {
        //             "fid": "f0c7b4bd067644e1b43e4af09633c4aa",
        //             "category": 4,
        //             "file_type": 1,
        //             "size": 522,
        //             "format_type": "text/plain",
        //             "name_space": 0,
        //             "series_dir": false,
        //             "album_dir": false,
        //             "more_than_one_layer": false,
        //             "upload_camera_root_dir": false,
        //             "fps": 0.0,
        //             "like": 0,
        //             "risk_type": 0,
        //             "file_name_hl_start": 0,
        //             "file_name_hl_end": 0,
        //             "duration": 0,
        //             "scrape_status": 0,
        //             "ban": false,
        //             "cur_version_or_default": 0,
        //             "save_as_source": false,
        //             "backup_source": false,
        //             "offline_source": false,
        //             "owner_drive_type_or_default": 0,
        //             "dir": false,
        //             "file": true,
        //             "_extra": {}
        //         },
        //         "path_info": "/测试",
        //         "partial_violation": false,
        //         "size": 522,
        //         "first_layer_file_categories": [
        //             4
        //         ],
        //         "download_pvlimited": false
        //     }
        // }
    }

    /**
     * 通过url获取分享文件详情
     * @param {*} url 
     */
    async getShareInfoByUrl(url) {
        // 夸克网盘
        if (this.getPanType(url) == 'quark'){
            let pwd_id = this.getUrlParam(url, '/s/');
            let stoken = await this.getStoken(pwd_id);

            let params = {
                "pr":"ucpro",
                "fr":"pc",
                "uc_param_str":"",
                "pwd_id":pwd_id,
                "stoken":stoken,
                "pdir_fid":"0",
                "force":"0",
                "_page":"1",
                "_size":"50",
                "_fetch_banner":"1",
                "_fetch_share":"1",
                "_fetch_total":"1",
                "_sort":"file_type:asc,file_name:asc"
            }

            let { status, code, data, message } = await this.handleFetch("https://drive-h.quark.cn/1/clouddrive/share/sharepage/detail", 'get', params);
            
            if (status == 200 && code == 0) {
                return {
                    code: 200,
                    msg: '获取成功！',
                    data: data
                }
            } else {
                return {
                    code: 400,
                    msg: message,
                    data: data
                }
            }
        }
    }

    /**
     * 更新资源（转存，刮削），供定时任务使用
     */
    async updateSource() {
        let that = this;
        console.log('开启刮削')

        let taskRes = await Task.findWithQuery({type: 1, delFlag: 0, status: 1});
        
        console.log('需刮削任务数:', taskRes.length)
        if (taskRes && taskRes.length) {
            let taskId = taskRes[0].id;

            let res = await Source.findWithQuery({status: 1});

            // 更新任务状态
            await Task.updateById(taskId, {status: 2});

            // 方式1： 并发+延时
            //await processArray(res);
            /**
             * 并发+延时
             * @param {*} array 请求数据源
             * @param {*} batchSize 并发数
             * @param {*} delay 等待时间 毫秒
             * @returns 
             */
            async function processArray(array, batchSize = 2, delay=5000) {
                for (let i = 0; i < array.length; i += batchSize) {
                const batch = array.slice(i, i + batchSize);
                const promises = batch.map(item => shareAndSave(item.shares, item.id)); // 替换yourMethod为实际方法
                
                try {
                    const results = await Promise.all(promises);
                    console.log(`批次 ${i/batchSize + 1} 完成:`, results);
                    
                    // 如果不是最后一批，则等待
                    if (i + batchSize < array.length) {
                    console.log(`等待 ${delay/1000} 秒...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    }
                } catch (error) {
                    console.error('请求出错:', error);
                }
                }
            }

            // 方式2： 顺序处理+批次延迟策略
            await sequentialBatchProcess(res);
            /**
             * 顺序处理+批次延迟策略
             * @param {*} array 请求数据源
             * @param {*} batchSize 每批最大请求数
             * @param {*} delayMs 等待时间 毫秒
             * @returns 
             */
            async function sequentialBatchProcess(array, batchSize = 10, delay = 5000) {
                const results = [];
                for (let i = 0; i < array.length; i++) {
                    let item = array[i];
                    try {
                        const result = await shareAndSave(item.shares, item.id);
                        results.push({ id: array[i], data: result });
                        
                        // 每处理完一个批次后等待
                        if ((i + 1) % batchSize === 0 && i !== array.length - 1) {
                            await new Promise(resolve => setTimeout(resolve, delay));
                        }
                    } catch (error) {
                        results.push({ id: array[i], error: error.message });
                    }
                }
                return results;
            }

            // 转存+分享+更新资源的标题，分享链接
            async function shareAndSave(url, id) {
                return new Promise(async resolve=>{
                    let res2 = await that.transferAndShare(url);
                    // console.log('res2:', res2)
                    if (res2.code == 200) {
                        let title = res2.data.title
                        let shares = res2.data.share_url

                        // console.log('res2:', title, shares)

                        Source.updateById(id, {
                            title,
                            shares,
                            old_shares: url,
                            status: 2,
                        })
                    }
                    await that.sleep(1000)
                    resolve(res2)
                })
            }

            // 更新任务状态
            await Task.updateById(taskId, {status: 1});
            return {}
        } else {
            return {}
        }
    }

    /**
     * 更新今日数据
     */
    async updateTodaySource(params) {
        let res = await this.handleFetch('http://192.168.3.51:6099/api/search', 'post', {...params});

        if (res.code == 200) {
            let list = res.data.items.map(item=>{
                delete item.id;
                return {
                    ...item,
                    status: 1,
                    createdAt: '',
                    updatedAt: ''
                }
            })

            if(list.length) {
                await Source.createAll(list)
            }
            return {}
        } else {
            return {}
        }
    }

    /**
     * 获取要转存资源的stoken
     * @return void
     */
    async getStoken (pwd_id) {
        let params = {
            pwd_id: pwd_id,
            passcode:"",
            // support_visit_limit_private_share:true
        }
        
        let res = await this.handleFetch('https://drive-h.quark.cn/1/clouddrive/share/sharepage/token?pr=ucpro&fr=pc&uc_param_str=', 'post', params);

        if (res.code == 0) {
            return res.data.stoken;
        } else {
            console.log('res:', res)
            throw new Error('stoken出错！'); 
        }
    }

    /**
     * 通用请求处理
     * @param {*} url 
     * @param {*} method 
     * @param {*} params 
     * @returns 
     */
    async handleFetch(url, method, params) {
        if (method.toUpperCase() == 'POST') {
            this.header.cookie = this.quark_cookie;
            let response = await fetch(url, {
                "headers": this.header,
                "body": JSON.stringify(params),
                "method": "POST"
            });
            return await response.json();
        } else if (method.toUpperCase() == 'GET') {
            this.header.cookie = this.quark_cookie;
            let response = await fetch(`${url}?${new URLSearchParams(params)}`, {
                "headers": this.header,
                "body": null,
                "method": "GET"
            });
            return await response.json();
        }
    }

    /**
     * 从给定的URL中提取特定部分
     * 
     * @param {string} url - 要解析的URL
     * @param {string} segment - 要提取的URL部分的关键字（如本例中的's/'后的部分）
     * @returns {string|null} - 提取的部分，如果未找到则返回null
     */
    getUrlParam(url, segment) {
        try {
            // 使用URL对象解析URL
            const parsedUrl = new URL(url);
            // 获取URL的路径部分
            const pathname = parsedUrl.pathname;
            
            // 查找关键字的位置
            const segmentIndex = pathname.indexOf(segment);
            
            // 如果找到了关键字
            if (segmentIndex !== -1) {
                // 提取关键字后的部分
                const afterSegment = pathname.substring(segmentIndex + segment.length);
                // 提取第一个'/'之前的部分（即我们想要的部分）
                const result = afterSegment.split('/')[0];
                
                // 返回结果
                return result;
            } else {
                // 如果未找到关键字，返回null
                return null;
            }
        } catch (error) {
            // 如果URL解析出错，返回null
            console.error('Invalid URL:', error);
            return null;
        }
    }

    /**
     * 获取网盘类型
     * @param {*} url 
     * @return {*} string
     */
    getPanType(url) {
        let type = '';
        if(url.indexOf('pan.quark.cn') > -1) {
            type = 'quark'
        }
        return type;
    }

    /**
     * 等待
     * @param {*} time 
     * @returns 
     */
    sleep (time) {
        return new Promise(resolve=>{
            setTimeout(()=>{
                resolve(true)
            }, time)
        })
    }

    async getDetailFromOther(title) {
        // https://www.djsopan.com/
        // http://xl.lsftea.cn/

        let response = await fetch(`https://www.ddb8.net/s/${title}.html`);
        
        let html = await response.text();
        const $ = cheerio.load(html);
        // 提取 item 中的数据
        const items = [];
        const types = {
            "夸克网盘": 1,
        }
        $('.left .box .list .item').each((index, element) => {
            const title = $(element).find('.title').text().trim();
            const source = $(element).find('.type span').text().trim().replace('来源：', '');
            const shareButtons = $('.btn:contains("复制分享")');
            let shares = '';
            shareButtons.each((i, el) => {
                const onclick = $(el).attr('@click.stop');
                let link = this.getPanUrl(onclick);
                link.forEach((item, k)=>{
                    shares+=`${item}${k>0?';':''}`
                })
            });
            items.push({ title, is_type: types[source], shares });
        });
        return items;
    }


    // strToObj('pr=ucpro&fr=pc&uc_param_str=&pwd_id=24ae8bc9c4bf&stoken=X%2BuVKlt7dDBDAo8qfBpN%2FH%2Fjxy1gNVN%2Fmp3lP%2FE3Hys%3D&pdir_fid=0&force=0&_page=1&_size=50&_fetch_banner=1&_fetch_share=1&_fetch_total=1&_sort=file_type:asc,file_name:asc&__dt=1375&__t=1748498058978')
    // function strToObj(str='') {
    //     let obj = {}
    //     let arr = str.split('&');
    //     arr.forEach(item=>{
    //         let arr2 = item.split('=');
    //         obj[arr2[0]] = arr2[1]
    //     })
    //     console.log(obj)
    //     localStorage.setItem('obj666', JSON.stringify(obj))
    // }
}

export default QuarkPlugin;