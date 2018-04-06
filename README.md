# soul-manga
> 使用reactjs + python/flask + sqlite + scrapy 构建的单页应用漫画站，里面还用到了gunicorn和fabric的python管理部署工具，当时自己构建自动部署的时候用的

### 安装
前置条件 [node.js](https://nodejs.org/) , [python3](https://www.python.org)

##### 安装js依赖
  `npm install`
##### 安装python依赖
  `pip install -r requirements.txt` 

##### 开启flask服务器  
  `cd server`
  `python web_server.py`
##### 启动react
  `npm start`

访问localhost:3000
over .....

2个问题：
一个是npm install的不包含自己修改的空格滚动到底部和下一页空格置顶
还一个是空格滚到底部还带翻页。。。