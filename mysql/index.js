'use strict';

const fs = require('fs');
const Promise = require('bluebird');
const co = Promise.coroutine;
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);
const mysql = require('mysql');
const cheerio = require('cheerio');
const dbconf = require('../config');

// 数据库连接池
const DB = 'wooyun',
      BUGTB = 'bugs',
      DROPTB = 'drops';

const pool = mysql.createPool({
    user: dbconf.dbuser,
    password: dbconf.dbpass,
});
const esc = pool.escape.bind(pool);

//文件名遍历
const walk = (dir, cb) => {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) {
            return cb(err);
        }
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) {
                return cb(null, results);
            }
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
};

// 将bugs列表保存到一个文件，方便断点续写
const saveBugLists = () => {
    return new Promise((resolve, reject) => {
        walk('./static/bugs', (err, result) => {
            let data = '';
            for (let i = 0, item; (item=result[i]) != null; i++) {
                if (item.indexOf('html') === -1) {
                    continue;
                }
                item = item.substr(14);
                data += item + '\n';
            }
            fs.writeFile('./mysql/bugLists.txt', data, 'utf8', (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
}

// 读取文件内容promise化
const readFile = (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// 创建数据库
const connect = () => {
    let client, q;

    return co(function*() {
        client = yield pool.getConnectionAsync();
        q = client.queryAsync.bind(client);
        yield q(`create database if not exists ${DB}`);
        yield q(`use ${DB}`);
        yield q(`create table if not exists ${BUGTB} (
            name varchar(255),
            title varchar(1000),
            author varchar(255),
            date varchar(255),
            type varchar(255),
            crop varchar(1000)
        )`);
        
        client.release();
    })();
}

// 写入数据库
const dbinit = (data) => {
    let client, q;

    return co(function*() {
        client = yield pool.getConnectionAsync();
        q = client.queryAsync.bind(client);
        yield q(`use ${DB}`);
        yield q(`insert into ${BUGTB} values(
                ${esc(data.name)}, 
                ${esc(data.title)},
                ${esc(data.author)},
                ${esc(data.date)},
                ${esc(data.type)},
                ${esc(data.crop)})`);
        client.release();
    })();
}

// 遍历bugs列表
const bugsIntoSql = (cb) => {
    let list, html ,$, content, n;
    
    return co(function* () {
        // 读取bugs列表文件
        list = yield readFile('./mysql/bugLists.txt');
        // 转换成数组方便操作
        list = list.split('\n');
        n = list.length;
        // 遍历写进数据库
        for (let i = 0; i<n-1; i++) {
            html = yield readFile(`./static/bugs/${list[i]}`);
            $ = cheerio.load(html);
            content = {
                name: list[i],
                title: $('.wybug_title').text().replace(/[\r\n\t\ ]/g, '').substr(5),
                author: $('.wybug_author').find('a').text().indexOf('protected') > -1 ? '匿名' : $('.wybug_author').find('a').text(),
                date: $('.wybug_date').text().replace(/[\r\n\t\ ]/g, '').substr(5, 10),
                type: $('.wybug_type').text().replace(/[\r\n\t\ ]/g, '').substr(5),
                crop: $('.wybug_corp').find('a').text().replace(/[\r\n\t\ ]/g, ''),
            }
            yield dbinit(content);
            console.log(`已写入${i+1}条`);
        }

        cb && cb();
    })();
}

// 入口函数
const main = () => {
    connect();
    setTimeout(() => {
        co(function* () {
            yield saveBugLists();
            yield bugsIntoSql();
        })();
    }, 1000);
}

main();
