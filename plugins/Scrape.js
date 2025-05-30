import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import QuarkPlugin from './QuarkPlugin.js';

const quarkPlugin = new QuarkPlugin();
class Scrape {
    constructor() {
        this.url = "";
        this.source_category_id = 0;
        this.quark_cookie = ''
        this.header = {}
    }

    async getDetail(title) {
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
     * 正则获取网盘链接
     */
    getPanUrl(text) {
        // 支持主流网盘的正则表达式（百度/夸克/阿里云等）
        const PAN_REGEX = /https?:\/\/(?:pan\.baidu\.com|yun\.baidu\.com|pan\.quark\.cn|www\.aliyundrive\.com)\/s\/[a-zA-Z0-9_-]+/g;

        // 方法1：严格匹配网盘域名格式
        const strictMatches = text.match(PAN_REGEX) || [];

        return [...new Set([...strictMatches])];
        
        // // 方法2：宽松匹配（备用方案）
        // const fallbackRegex = /https?:\/\/[^\s]+/g;
        // const allUrls = text.match(fallbackRegex) || [];
        // const fallbackMatches = allUrls.filter(url => 
        //     url.includes('pan.') || url.includes('quark') || url.includes('aliyundrive')
        // );

        // 合并去重
        // return [...new Set([...strictMatches, ...fallbackMatches])];
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
}

export default Scrape;