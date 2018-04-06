# soul-manga
> 使用reactjs + python/flask + sqlite + scrapy 构建的单页应用漫画站，里面还用到了gunicorn和fabric的python管理部署工具，当时自己构建自动部署的时候用的

<br />

![soul_manga](soul_manga.jpg)
<br />
<br />

![soul1](soul1.gif)
<br />
<br />
<br />

![soul2](soul2.gif)


### 安装
前置条件 [node.js](https://nodejs.org/) , [python3](https://www.python.org)

#### 安装js依赖
  `npm install`
#### 安装python依赖
  `pip install -r requirements.txt` 

#### 开启flask服务器  
  `cd server`
  `python web_server.py`
#### 启动react
  `npm start`

访问`localhost:3000`  over .....

#### 关于scrapy
`soul_manga_spider.py`定义了三种抓取方式，`REQ_TYPE`分别对应不同的url类型：单个漫画，单个页面的所有漫画，以及全部漫画。还有一个`is_update`参数用于表明是否只抓取最近更新的页面url然后做增量更新。之前自己部署的时候基本上配合`crontab`12小时抓取一次足够了,默认情况`is_update`是false，且`REQ_TYPE`是default表示什么都不做，默认使用我已经抓取的db。日志级别根据自己需要调整`setting.py`的`LOG_LEVEL`和`LOG_FILE`

#### 不支持移动端