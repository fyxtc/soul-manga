import scrapy
import sys
import logging
import re
from manga.items import MangaItem
from manga.items import SqliteItem
import sqlite3
from hanziconv import HanziConv

class SoulMangaSpider(scrapy.Spider):
    name = "soul_manga"
    xpath = {
        "index_urls": ["http://www.cartoonmad.com/comic99.html"],
        "next_page": "//a[contains(., '下一頁')]/@href",
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
        "summary":"//legend[contains(., '簡介')]/../table/tr/td/text()",

        "last_update_date":"/html/body/table/tr[1]/td[2]/table/tr[4]/td/table/tr[1]/td[2]/b/font/text()",
        "status":"/html/body/table/tr[1]/td[2]/table/tr[4]/td/table/tr[2]/td[2]/table[1]/tr[7]/td/img[2]/@src", #chap9.gif
        "pop":"/html/body/table/tr[1]/td[2]/table/tr[4]/td/table/tr[2]/td[2]/table[1]/tr[11]/td/text()",
        "tags":"/html/body/table/tr[1]/td[2]/table/tr[4]/td/table/tr[2]/td[2]/table[1]/tr[13]/td/text()",
        "chapters":"/html/body/table/tr[1]/td[2]/table/tr[4]/td/table/tr[2]/td[2]/table[1]/tr[7]/td/font/text()", 
        "chapter_images":"",
        "vol_or_ch":"", #通过chapter/vol设置，优先话

        "all_chapters": "//a[contains(., '話')]/../a/text()",
        "all_chapters_pages": "//a[contains(., '話') and contains(., '第')]/../font/text()",
        "all_vols": "//a[contains(., '卷')]/../a/text()",
        "all_vols_pages": "//a[contains(., '卷')]/../font/text()",
        "image_base_url": "/html/body/table/tr[5]/td/a/img/@src"
    }
    sql_item = {}

    def get_sql_item(self, response):
        # 异步代码，不能通过self获取，要直接传递下去，通过meta
        sql_item = {}
        sql_item["mid"] = response.xpath(self.xpath.get("mid")).extract_first()
        sql_item["name"] = response.xpath(self.xpath.get("name")).extract_first()
        sql_item["author"] = response.xpath(self.xpath.get("author")).extract_first()
        sql_item["cover_image"] = response.xpath(self.xpath.get("cover_image")).extract_first()
        sql_item["cover_update_info"] = response.xpath(self.xpath.get("cover_update_info")).extract_first()
        sql_item["category"] = response.xpath(self.xpath.get("category")).extract_first()
        sql_item["summary"] = response.xpath(self.xpath.get("summary")).extract()[0]
        sql_item["last_update_date"] = response.xpath(self.xpath.get("last_update_date")).extract()[1]
        sql_item["status"] = response.xpath(self.xpath.get("status")).extract_first()
        sql_item["pop"] = response.xpath(self.xpath.get("pop")).extract_first()
        sql_item["tags"] = response.xpath(self.xpath.get("tags")).extract_first()

        chapters_len = len(response.xpath(self.xpath.get("all_chapters")).extract())
        if(chapters_len != 0):
            sql_item["all_chapters_len"] = chapters_len
            sql_item["all_chapters_pages"] = response.xpath(self.xpath.get("all_chapters_pages")).extract()
            sql_item["vol_or_ch"] = 0
        else:
            sql_item["all_chapters_len"] = len(response.xpath(self.xpath.get("all_vols")).extract())
            sql_item["all_chapters_pages"] = response.xpath(self.xpath.get("all_vols_pages")).extract()
            sql_item["vol_or_ch"] = 1

        for k, v in sql_item.items():
            if isinstance(v, str) and k != "last_update_date":
                v = re.sub(r"\s+", "", v, flags=re.UNICODE)
            if isinstance(v, str):
                v = HanziConv.toSimplified(v)

            if k == "mid":
                v = int(v[v.rfind("/")+1:v.rfind(".")])
            elif k in ["author", "tags", "pop"]:
                v = v[v.find("：")+1:]
            elif k == "category":
                v = self.get_category(v) # remove 系列
            elif k == 'last_update_date':
                temp = str.strip(v)
                v = temp[temp.find(" ")+1:]
            elif k == "status":
                v = "已完结" if v.find("chap9.gif") != -1 else "连载中"
            elif k == "all_chapters_pages":
                temp = [re.findall(r"\d+", x)[0] for x in v]
                v = ','.join(temp)
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
        self.sqlite_file = self.settings.get("SQLITE_FILE")
        self.sqlite_table = self.settings.get("SQLITE_TABLE")
        # self.log("fuck " + self.sqlite_file + ", " + self.sqlite_table)
        self.conn = sqlite3.connect(self.sqlite_file)
        self.cur = self.conn.cursor()

        # 获取全部漫画
        urls = self.xpath.get("index_urls")
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse_index)

        # 获取全页漫画
        # urls = self.xpath.get("page_urls")
        # for url in urls:
        #     yield scrapy.Request(url=url, callback=self.parse_page)

        # 获取单个漫画
        # urls = self.xpath.get("urls")
        # for url in urls:
        #     yield scrapy.Request(url=url, callback=self.parse)

    def parse_index(self, response):
        next_url = response.xpath(self.xpath.get("next_page")).extract_first()
        next_url = response.urljoin(next_url) 
        # logging.info("next url " + next_url)
        # # for url in urls:
        # #     logging.info("fuck next ")
        # #     yield scrapy.Request(url=url, callback=self.parse_page)
        return self.parse_page(response, next_url)


    def parse_page(self, response, next_url):
        mangas = re.findall(r"comic/\d{4}.html", str(response.body))#[:20]
        if response.url.find("/comic/") != -1:
            mangas = [x[6:] for x in mangas]
        # self.log(mangas)
        # 集合推导使用{}
        urls = {response.urljoin(x) for x in mangas}
        # self.log(urls)

        # # 这样就把当前页(page_urls)包含的所有漫画都爬了😯
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse, meta={"next_url": next_url})


    def parse(self, response):
        # 其实这里本来每个漫画的url也就走一次吧。。。简直完美
        item = self.get_sql_item(response)
        mid = item.get("mid")
        if self.is_mid_exist(mid):
            # todo 这里有bug，不能mid存在就跳过啊。。。这样走next_url的请求了，我先全部清除了来过吧。。。这样没问题。。。不。先爬到spider文件夹下的db吧，改setting
            # logging.info("mid {0} is exist, skip ".format(mid))
            return
        url = response.xpath(self.xpath.get("chapter")).extract_first()
        if not url:
            # todo 这里才获取vol，会导致上面的get_sql_item里面的all_chapters_pages为空数组导致list下标0越界
            url = response.xpath(self.xpath.get("vol")).extract_first()
        assert url, response.url +" is fuck" 
        first_chapter_url = response.urljoin(url)
        yield scrapy.Request(url=first_chapter_url, callback=self.parse_image_base_url, meta={"item": item, "next_url": response.meta.get("next_url")})

    def parse_image_base_url(self, response):
        url = response.xpath(self.xpath.get("image_base_url")).extract_first()
        # logging.info(response.url + ", " + str(url))
        item = response.meta.get("item")
        # logging.info(item)
        assert item != None
        mid = item.get("mid")
        image_base_url = url[:url.find("/"+str(mid)+"/")]
        item["image_base_url"] = image_base_url
        # self.log(image_base_url)
        self.write_database(item)
        next_url = response.meta.get("next_url")
        logging.info("next url: " + next_url)
        yield scrapy.Request(url=next_url, callback=self.parse_index)

        # 解析一个完成了之后，加入next_page_url，可以这样每一个item解析完都会请求这个，虽然scrapy自己去重了，但是毕竟多一步判断，先这样写吧

    def write_database(self, item):
        # 这个写法确实吊，但是要注意.values()2/3表现好像不一样，3会有dictvalue之类的字符串，所以和keys一样用join连接吧，但是。。。int就跪了握草，这怎么整，转tunple就好了
        sql = 'insert into {0} ({1}) values ({2})'.format(self.sqlite_table, ', '.join(item.keys()), ', '.join(['?'] * len(item.keys())))
        logging.info("insert mid " + str(item.get("mid")) + ": " + item.get("name") + " category: " + str(item.get("category")))
        values = tuple(item.values())
        # self.log(values)
        self.cur.execute(sql, values)
        self.conn.commit()

    def is_mid_exist(self, mid):
        sql = "select mid from {0} where mid = ? ".format(self.sqlite_table)
        # 逗号是必须的，不然会被解析成括号，而不是tunple
        cursor = self.cur.execute(sql, (mid, ))
        return cursor.fetchone() != None
        # 查询应该不用commit，save的操作才需要
        # self.conn.commit()

    def closed(self, reason):
        if self.conn:
            self.conn.close()















