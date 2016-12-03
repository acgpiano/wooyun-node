'use strict';

const express = require('express'),
      handlebars = require('express-handlebars'),
      path = require('path');

const config = require('./config');

const app = express();

// 处理静态资源
app.use(express.static(path.join(__dirname, 'static')));

// 设置模板引擎
app.engine('hbs', handlebars({
    layoutsDir: 'views',
    defaultLayout: 'layout',
    extname: '.hbs'
}));
app.set('view engine', 'hbs');

// 处理路由中间件
app.use(require('./router'));

app.listen(config.port, () => {
    console.log(`Server running on ${config.port}`);
});