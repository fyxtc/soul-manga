import scrapy
import sys
import logging
import re
from manga.items import MangaItem
from manga.items import SqliteItem
import sqlite3
from hanziconv import HanziConv
import os

# 抓取的类型: 整个网站，当个类型页面(比如冒险)，单个漫画。可见参照对应的urls
# 此时的all有问题，因为http://www.cartoonmad.com/comic99.100的数据和99.01是一样的，cardtonnmad的bug
# 可以使用REQ_PAGE，然后打开page_urls的所有注释达到同样的效果
REQ_DEFAULT, REQ_ALL, REQ_PAGE, REQ_SINGLE = -1, 0, 1, 2
# 默认不更新，且不抓取任何页面，使用项目自带的soul_manga.db
IS_UPDATE = False 
REQ_TYPE = REQ_DEFAULT
# REQ_TYPE = REQ_ALL

class SoulMangaSpider(scrapy.Spider):
    name = "soul_manga"
    xpath = {
        "single_urls": ["http://www.cartoonmad.com/comic/1152.html"],
        # "index_urls": ["http://www.cartoonmad.com/comic99.html"],
        "index_urls": [
            "http://www.cartoonmad.com/comic01.html",
            "http://www.cartoonmad.com/comic02.html",
            "http://www.cartoonmad.com/comic03.html",
            "http://www.cartoonmad.com/comic04.html",
            "http://www.cartoonmad.com/comic07.html",
            "http://www.cartoonmad.com/comic08.html",
            "http://www.cartoonmad.com/comic09.html",
            "http://www.cartoonmad.com/comic10.html",
            "http://www.cartoonmad.com/comic13.html",
            "http://www.cartoonmad.com/comic14.html",
            "http://www.cartoonmad.com/comic16.html",
            "http://www.cartoonmad.com/comic17.html",
            "http://www.cartoonmad.com/comic18.html",
            "http://www.cartoonmad.com/comic21.html",
            "http://www.cartoonmad.com/comic22.html",
        ],  

        "update_urls": ["http://www.cartoonmad.com/newcm.html"],
        "next_page": "//a[contains(., '下一頁')]/@href",
        # 所有列别的urls
        "page_urls": [
            "http://www.cartoonmad.com/comic01.html",
            # "http://www.cartoonmad.com/comic02.html",
            # "http://www.cartoonmad.com/comic03.html",
            # "http://www.cartoonmad.com/comic04.html",
            # "http://www.cartoonmad.com/comic07.html",
            # "http://www.cartoonmad.com/comic08.html",
            # "http://www.cartoonmad.com/comic09.html",
            # "http://www.cartoonmad.com/comic10.html",
            # "http://www.cartoonmad.com/comic13.html",
            # "http://www.cartoonmad.com/comic14.html",
            # "http://www.cartoonmad.com/comic16.html",
            # "http://www.cartoonmad.com/comic17.html",
            # "http://www.cartoonmad.com/comic18.html",
            # "http://www.cartoonmad.com/comic21.html",
            # "http://www.cartoonmad.com/comic22.html",
        ],  
        "urls": ["http://www.cartoonmad.com/comic/1090.html"],
        "chapter": "//a[contains(., '話') and contains(., '第')]/@href",  # 默认下载话
        "vol": "//a[contains(., '卷')]/@href",  # 默认下载话
        "image_page": "//option[contains(., '頁')]/@value", # 遍历这一话的所有img页的超链接  
        "image": "//img[contains(@src, 'cartoonmad.com')]/@src", #这一话的图片

        # 不知道为啥，chrome里面可以的，scrapy一碰到tbody就跪。。原因如下。。原来tbody是浏览器加的...那就简单了，我去了就行了。。
        # Firefox, in particular, is known for adding <tbody> elements to tables. Scrapy, on the other hand, does not modify the original page HTML, 
        # so you won’t be able to extract any data if you use <tbody> in your XPath expressions.

        "mid":"/html/body/table/tr[1]/td[2]/table/tr[3]/td[2]/a[3]/@href",
        "name":"/html/body/table/tr[1]/td[2]/table/tr[3]/td[2]/a[3]/text()",
        "author":"/html/body/table/tr[1]/td[2]/table/tr[4]/td/table/tr[2]/td[2]/table[1]/tr[5]/td/text()",
        # todo: 还有动态封面卧槽其实这个不用爬，通过mid就能知道了，http://img.cartoonmad.com/ctimg/1490.jpg， http://img.cartoonmad.com/ctimg/1490.jpg,好像就这两个地方...上下午换的？interesting
        "cover_image":"//div[@class='cover']/../img/@src",
        "cover_update_info":"/html/body/table/tr[1]/td[2]/table/tr[4]/td/table/tr[2]/td[2]/table[1]/tr[7]/td/font/text()",
        "category":"/html/body/table/tr[1]/td[2]/table/tr[4]/td/table/tr[2]/td[2]/table[1]/tr[3]/td/a[1]/text()",
        # todo: 嵌套的<p>没有实现，比如棋魂...
        # "summary":"//legend[contains(., '簡介')]/../table/tr/td/text()",
        # string抓取嵌套文本
        "summary":"string(//legend[contains(., '簡介')]/../table/tr/td)",

        "last_update_date":"/html/body/table/tr[1]/td[2]/table/tr[4]/td/table/tr[1]/td[2]/b/font/text()",
        "status":"/html/body/table/tr[1]/td[2]/table/tr[4]/td/table/tr[2]/td[2]/table[1]/tr[7]/td/img[2]/@src", #chap9.gif
        "pop":"/html/body/table/tr[1]/td[2]/table/tr[4]/td/table/tr[2]/td[2]/table[1]/tr[11]/td/text()",
        "tags":"//td[contains(., '漫畫標籤')]/./a/text()",
        "chapters":"/html/body/table/tr[1]/td[2]/table/tr[4]/td/table/tr[2]/td[2]/table[1]/tr[7]/td/font/text()", 
        "chapter_images":"",
        # "vol_or_ch":"",

        "all_chapters": "//a[contains(., '話') and contains(., '第')]/text()",
        "all_chapters_pages": "//a[contains(., '話') and contains(., '第')]/../font/text()",
        "all_vols": "//a[contains(., '卷') and contains(., '第')]/text()",
        "all_vols_pages": "//a[contains(., '卷') and contains(., '第')]/../font/text()",
        # "image_base_url": "/html/body/table/tr[5]/td/a/img/@src"
        "image_base_url": "//img[contains(@src, 'cartoonmad.com')]/@src", #这一话的图片
    }
    sql_item = {}


    # def __init__(self, is_update, *args, **kwargs):
    #     super(SoulMangaSpider, self).__init__(*args, **kwargs)

    def get_chapter(self, ch):
        index1 = ch.find("第")
        index2 = ch.find("話")
        return int(str.strip(ch[index1+1: index2]))

    def get_sql_item(self, response):
        # 异步代码，不能通过self获取，要直接传递下去，通过meta
        sql_item = {}
        sql_item["mid"] = response.xpath(self.xpath.get("mid")).extract_first()
        sql_item["name"] = response.xpath(self.xpath.get("name")).extract_first()
        sql_item["author"] = response.xpath(self.xpath.get("author")).extract_first()
        sql_item["cover_image"] = response.xpath(self.xpath.get("cover_image")).extract_first()
        sql_item["cover_update_info"] = response.xpath(self.xpath.get("cover_update_info")).extract_first()
        sql_item["category"] = response.xpath(self.xpath.get("category")).extract_first()
        sql_item["summary"] = response.xpath(self.xpath.get("summary")).extract_first()
        sql_item["last_update_date"] = response.xpath(self.xpath.get("last_update_date")).extract()[1]
        sql_item["status"] = response.xpath(self.xpath.get("status")).extract_first()
        sql_item["pop"] = response.xpath(self.xpath.get("pop")).extract_first()
        sql_item["tags"] = response.xpath(self.xpath.get("tags")).extract()

        chapters = response.xpath(self.xpath.get("all_chapters")).extract()
        sql_item["all_chapters_len"] = len(chapters)
        sql_item["all_chapters_pages"] = response.xpath(self.xpath.get("all_chapters_pages")).extract()
        sql_item["chapter_start_index"] = 1 if len(chapters) == 0 else self.get_chapter(chapters[0])
        sql_item["last_update_chapter"] = 0 if len(chapters) == 0 else self.get_chapter(chapters[-1])
        sql_item["last_update_vol_or_ch"] = 1 if len(chapters) == 0 else 0

        vols = response.xpath(self.xpath.get("all_vols")).extract()
        sql_item["all_vols_len"] = len(vols)
        sql_item["all_vols_pages"] = response.xpath(self.xpath.get("all_vols_pages")).extract()

        for k, v in sql_item.items():
            if isinstance(v, str) and k != "last_update_date":
                v = re.sub(r"\s+", "", v, flags=re.UNICODE)
            if isinstance(v, str):
                v = HanziConv.toSimplified(v)

            if k == "mid":
                v = int(v[v.rfind("/")+1:v.rfind(".")])
            elif k in ["author", "pop"]:
                v = v[v.find("：")+1:]
            elif k == "category":
                v = self.get_category(v) # remove 系列
            elif k == 'last_update_date':
                temp = str.strip(v)
                v = temp[temp.find(" ")+1:]
            elif k == "status":
                v = "已完结" if v.find("chap9.gif") != -1 else "连载中"
            elif k == "all_chapters_pages" or k == "all_vols_pages":
                temp = [re.findall(r"\d+", x)[0] for x in v]
                v = ','.join(temp)
            elif k == "tags":
                v = ','.join(v)
            elif k == "summary":
                v = str.strip(v)
            sql_item[k] = v

        # for k, v in sql_item.items():
        #     print(k + ": " + str(v))
        return sql_item

    def get_category(self, ori):
        category_map = [
            '格斗',
            '魔法',
            '侦探',
            '竞技',
            '恐怖',
            '战国',
            '魔幻',
            '冒险',
            '校园',
            '搞笑',
            '少女',
            '少男',
            '科幻',
            '港产',
            '其他' 
        ]
        cat = ori[:2]
        assert (cat in category_map), cat+" wtf?"
        return category_map.index(cat)

    def start_requests(self):
        self.sql = None
        self.values = []
        self.sqlite_file = self.settings.get("SQLITE_FILE")
        self.sqlite_table = self.settings.get("SQLITE_TABLE")

        # self.log("fuck " + self.sqlite_file + ", " + self.sqlite_table)
        self.conn = sqlite3.connect(self.sqlite_file)
        self.cur = self.conn.cursor()
        exist = self.cur.execute("pragma table_info('soul_manga')").fetchone()
        logging.info("exist table soul_mange? ------- " + str(exist))
        if not exist:
            # print(os.system("pwd"))
            os.system('sqlite3 ../server/soul_manga.db ".read ../server/soul_manga.sql"')

        logging.info("IS_UPDATE >>>>>>>>>>>>>>>>>>> " + str(IS_UPDATE))

        # 本地跑吧。。。。vps crontab各种命令找不到，好烦= =
        # 本地的话需要cron爬取然后接着运行fab deploy，可以写个fab update，然后让cron调取fab update => fab deployj
        if IS_UPDATE:
            # 抓取更新  更新其实最好是另外放在别的脚本里，然后定时任务去调用才是最好的，先手动注释打开吧。或者传命令行参数也可以哦，机智如我
            logging.info("start update crawl >>>>>>>>>>>> ")
            # 注意这里只抓取每日的更新页，所以如果隔了一天没更新，然后想更新全部的话，还是还是得走全量哦
            urls = self.xpath.get("update_urls")
            for url in urls:
                yield scrapy.Request(url=url, callback=self.parse_update)
        else:
            # 自己按需要打开，并且根据需要调整page_urls和single_urls

            if REQ_TYPE == REQ_ALL:
                # 获取全部漫画
                urls = self.xpath.get("index_urls")
                for url in urls:
                    yield scrapy.Request(url=url, callback=self.parse_index)
            elif REQ_TYPE == REQ_PAGE:
                # 获取全页漫画
                urls = self.xpath.get("page_urls")
                # 是否只获取当前page，还是要获取这个类别下的所有下一页
                only_cur_page = True
                for url in urls:
                    yield scrapy.Request(url=url, callback=self.parse_page if only_cur_page else self.parse_index)
            elif REQ_TYPE == REQ_SINGLE:
                # 获取单个漫画
                urls = self.xpath.get("single_urls")
                for url in urls:
                    yield scrapy.Request(url=url, callback=self.parse)
            else:
                logging.error("\n\n <<<<<<<<<<<<<<<<< WHAT YOU WANT MAN, PLEASE SPECIFY ONE CRAWL FORMAT： ALL OR PAGE OR SINGLE !!!!!!!!!!!! >>>>>>>>>>>>> \n")


    # 在vps上用cron起了定时任务去爬取更新了，也就是说本地如果改了db之后，那必须是完全重新抓取，或者设置爬取前几个页面才是最新的
    # 爬虫脚本我就没有放到fab deploy里面去了，直接上传这个作为更新版本就行了
    def parse_update(self, response):
        # 抓取更新和抓取普通的页面并没有很大区别，只是要注意写入数据库的时候不能仅仅通过mid判断，还要有update_time
        mangas = re.findall(r"comic/\d{4}.html", str(response.body))#[:20]
        if response.url.find("/comic/") != -1:
            mangas = [x[6:] for x in mangas]
        urls = {response.urljoin(x) for x in mangas}
        # logging.info(urls)

        # # 这样就把当前页(page_urls)包含的所有漫画都爬了😯
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse, meta={"is_update": True})

    def parse_index(self, response):
        next_url = response.xpath(self.xpath.get("next_page")).extract_first()
        # print("parse_index next_url " + str(next_url))
        next_url = response.urljoin(next_url) 
        # logging.info("next url " + next_url)
        # # for url in urls:
        # #     logging.info("fuck next ")
        # #     yield scrapy.Request(url=url, callback=self.parse_page)
        return self.parse_page(response, next_url)


    def parse_page(self, response, next_url=None):
        # print("parse_page next_url " + str(next_url))
        mangas = re.findall(r"comic/\d{4}.html", str(response.body))#[:20]
        if response.url.find("/comic/") != -1:
            mangas = [x[6:] for x in mangas]
        # self.log(mangas)
        # 集合推导使用{}
        urls = {response.urljoin(x) for x in mangas}
        # self.log(urls)

        # # 这样就把当前页(page_urls)包含的所有漫画都爬了😯
        # print(urls)
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse, meta={"next_url": next_url})


    def parse(self, response):
        # 其实这里本来每个漫画的url也就走一次吧。。。简直完美
        item = self.get_sql_item(response)
        # logging.info(item)
        
        mid = item.get("mid")
        last_update_date = item.get("last_update_date")
        if not self.is_need_insert_or_update(mid, last_update_date):
            # todo 这里有bug，不能mid存在就跳过啊。。。这样走不了next_url的请求了，我先全部清除了来过吧。。。这样没问题。。。不。先爬到spider文件夹下的db吧，改setting
            # 但是增量更新这里是绕不开的，必须想办法，判断最后更新日期是否一样，如果不一样就update chapter字段
            # 然后每天的计划应该是0点爬“最新上架”页面的头几页，头两页基本上能保证当天的更新度了，其实应该一页就行了。。保守起见吧
            logging.info("mid {0} is exist and last_update_date is same, skip ".format(mid))
            return
        url = response.xpath(self.xpath.get("chapter")).extract_first()
        if not url:
            # 这里好奇怪啊。。。我这样写明明只能获取一个，要么是vol要么是chapter....怎么没问题呢
            url = response.xpath(self.xpath.get("vol")).extract_first()
        assert url, response.url +" is fuck" 
        first_chapter_url = response.urljoin(url)
        yield scrapy.Request(url=first_chapter_url, callback=self.parse_image_base_url, meta={"item": item, "next_url": response.meta.get("next_url")})

    # todo: 如果当前页全部skip了的话，这里进不来，那么next_url就失效了
    def parse_image_base_url(self, response):
        # logging.info(response)
        # logging.info(response.xpath(self.xpath.get("image_base_url")))
        url = response.xpath(self.xpath.get("image_base_url")).extract_first()
        # logging.info(response.url + ", " + str(url))
        item = response.meta.get("item")
        # logging.info(item)
        assert item != None
        assert url != None
        mid = item.get("mid")
        image_base_url = url[:url.find("/"+str(mid)+"/")]
        item["image_base_url"] = image_base_url
        # self.log(image_base_url)
        # logging.info(item)

        self.write_database(item)


        next_url = response.meta.get("next_url")
        if next_url:
            # logging.info("next url: " + next_url)
            yield scrapy.Request(url=next_url, callback=self.parse_index)

        # 解析一个完成了之后，加入next_page_url，可以这样每一个item解析完都会请求这个，虽然scrapy自己去重了，但是毕竟多一步判断，先这样写吧

    def write_database(self, item):
        # 这个写法确实吊，但是要注意.values()2/3表现好像不一样，3会有dictvalue之类的字符串，所以和keys一样用join连接吧，但是。。。int就跪了握草，这怎么整，转tunple就好了
        sql = 'insert or replace into {0} ({1}) values ({2})'.format(self.sqlite_table, ', '.join(item.keys()), ', '.join(['?'] * len(item.keys())))
        if not self.sql:
            self.sql = sql
        # logging.info(sql)
        logging.info("insert or replace mid " + str(item.get("mid")) + ": " + item.get("name") + " category: " + str(item.get("category")))
        values = tuple(item.values())
        # self.log(values)

        # 空间换时间，先存sql最后统一调用。还能优化为一次插入，因为每次sql的stat都是一样的
        # 没有卵用，因为这不是瓶颈。。。还是获取resp耗时间,4000条写入的优化也就几秒的时间
        # self.values.append(values)

        self.cur.execute(sql, values)
        self.conn.commit()

    def is_need_insert_or_update(self, mid, last_update_date):
        # mid不用取了，取时间一样的，就能知道在不在了 
        sql = "select last_update_date from {0} where mid = ? ".format(self.sqlite_table)
        # 逗号是必须的，不然会被解析成括号，而不是tunple
        cursor = self.cur.execute(sql, (mid, ))
        res = cursor.fetchone()
        # logging.info(res)
        if res == None:
            # 没有的话，肯定要插入
            # logging.info(str(mid) + " is not exist, insert it ")
            return True
        else:
            # 如果有的话，看更新日期是否一样，注意，这个无论是否是更新调用过来的都需要走
            db_last_update_date = res[0]
            if last_update_date != db_last_update_date:
                logging.info("update mid " + str(mid) + " old date " + db_last_update_date + " ==> " + last_update_date)
                return True
        return False
        # 查询不用commit，save的操作才需要
        # self.conn.commit()

    def write_all_sqls(self):
        assert self.cur
        logging.info("write all sqls/manga count >>>>>>>>>>>>>>> " + str(len(self.values)))
        # print("write all sqls/manga count >>>>>>>>>>>>>>> " + str(len(self.values)))
        import time
        t1 = time.time()
        for v in self.values:
            self.cur.execute(self.sql, v)
        self.conn.commit() 
        t2 = time.time()
        print("cost time " + str(t2-t1))


    def closed(self, reason):
        if self.conn:
            # self.write_all_sqls()
            self.conn.close()















