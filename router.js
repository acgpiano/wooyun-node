'use strict';

const Promise = require('bluebird');
const co = Promise.coroutine;
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);
const mysql = require('mysql');
const app = require('express')();

const dbconf = require('./config');

// 数据库连接池
const DB = 'wooyun',
      BUGTB = 'bugs',
      DROPTB = 'drops';

const pool = mysql.createPool({
    user: dbconf.dbuser,
    password: dbconf.dbpass,
});
const esc = pool.escape.bind(pool);

var type = '',
      content = '';


app.get('/', (req, res) => {
    res.render('search',{
        page: 'index',
    });
});

app.get('/result', (req, res) => {
    type = req.query.type;
    content = `%${req.query.content}%`;
    res.render('result',{
        page: 'result',
        content: req.query.content,
    });
});

app.get('/check', (req, res) => {
    let page = req.query.page*20 || 0;
    let client, q, result, count;

    if (!type) {
        res.json({
            code: 500,
            error: '未选择类型'
        })
        return;
    }

    return co(function*() {
        client = yield pool.getConnectionAsync();
        q = client.queryAsync.bind(client);
        yield q(`use ${DB}`);

        if (type === 'default') {
            count = yield q(`select count(*) from ${BUGTB}`);
            result = yield q(`select * from ${BUGTB} order by date desc limit ${page},20`);
        } else {
            count = yield q(`select count(*)  from ${BUGTB} where ${type} like ${esc(content)}`);
            result = yield q(`select * from ${BUGTB} where ${type} like ${esc(content)} order by date desc limit ${page},20`);
        }
        res.render('table', {
            page: 'result',
            layout: false,
            result: result,
            count: count[0]['count(*)'],
        });
        
        client.release();
    })();
});
module.exports = app;