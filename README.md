## wooyun-node
这是wooyun.org镜像的node.js版本，用的mysql。  
方便新手小白使用，搭建方法非常简单。  
首先需要安装mysql，要把数据库语言设置成utf8(非常重要，不然会出错)。由于各个系统设置方法不同，需自行百度。检测是否成功可以登进数据库，执行   
```
status;
```  
如果是以下状态，就代表可以下一步了。
![](http://oevuw60db.bkt.clouddn.com/QQ20161203-0@2x.png?imageView2/2/w/640/q/90)  
把该项目克隆到本地  
```
git clone https://github.com/acgpiano/wooyun-node.git
```  
修改config.js里面的用户名和密码，改为你的mysql的用户名和密码，port是服务的端口，可以自行修改。
下载wooyun的静态资源:  
链接: [https://pan.baidu.com/s/1jIjX0LS](https://pan.baidu.com/s/1jIjX0LS) 密码: mqnp  
需要解压到wooyun-node/static/bugs/   
文件夹下面(自行新建bugs文件夹)  
接下来安装node.js，去官网下载就好了。  
接下来安装cnpm(如果可以连Internet这一步可以忽略,以下命令的cnpm全都可以用npm代替)  
```
npm install -g cnpm --registry=https://registry.npm.taobao.org
```  
然后在wooyun-node里执行  
```
cnpm install
```  
等所有的依赖装完再执行  
```
npm run db
```  
等数据库建表完后，共40293条，再执行  
```
npm start
```  
默认port端口是9999，可以在config.js里面修改  
打开浏览器 http://127.0.0.1:9999就可以使用了。


仅供自学使用，如果要部署到公网可以自己改用orm，修改表结构加速查询，防注入。