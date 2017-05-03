import scrapy
import sys
import logging
import re
from manga.items import MangaItem
from manga.items import SqliteItem
import sqlite3

class SoulMangaSpider(scrapy.Spider):
    name = "soul_manga"
    xpath = {
        "index_url": ["http://www.cartoonmad.com/comic21.html"], # 
        "urls": ["http://www.cartoonmad.com/comic/1090.html"],
        "chapter": "//a[contains(., '話')]/@href",  # 默认下载话
        "vol": "//a[contains(., '卷')]/@href",  # 默认下载话
        "image_page": "//option[contains(., '頁')]/@value", # 遍历这一话的所有img页的超链接  
        "image": "//img[contains(@src, 'cartoonmad.com')]/@src", #这一话的图片

        # 不知道为啥，chrome里面可以的，scrapy一碰到tbody就跪。。原因如下。。原来tbody是浏览器加的...那就简单了，我去了就行了。。
        # Firefox, in particular, is known for adding <tbody> elements to tables. Scrapy, on the other hand, does not modify the original page HTML, 
        # so you won’t be able to extract any data if you use <tbody> in your XPath expressions.

        "mid":"/html/body/table/tr[1]/td[2]/table/tr[3]/td[2]/a[3]/@href",
        "name":"/html/body/table/tr[1]/td[2]/table/tr[3]/td[2]/a[3]/text()",
        "author":"/html/body/table/tr[1]/td[2]/table/tr[4]/td/table/tr[2]/td[2]/table[1]/tr[5]/td/text()",
        "cover_image":"//div[@class='cover']/../img/@src",
        "cover_update_info":"/html/body/table/tr[1]/td[2]/table/tr[4]/td/table/tr[2]/td[2]/table[1]/tr[7]/td/font/text()",
        "category":"/html/body/table/tr[1]/td[2]/table/tr[4]/td/table/tr[2]/td[2]/table[1]/tr[3]/td/a[1]/text()",
        "summary":"//legend[contains(., '簡介')]/../table/tr/td/text()",

        "last_update_date":"/html/body/table/tr[1]/td[2]/table/tr[4]/td/table/tr[1]/td[2]/b/font/text()",
        "status":"/html/body/table/tr[1]/td[2]/table/tr[4]/td/table/tr[2]/td[2]/table[1]/tr[7]/td/img[2]/@src", #chap9.gif
        "pop":"/html/body/table/tr[1]/td[2]/table/tr[4]/td/table/tr[2]/td[2]/table[1]/tr[11]/td/text()",
        "tags":"/html/body/table/tr[1]/td[2]/table/tr[4]/td/table/tr[2]/td[2]/table[1]/tr[13]/td/text()",
        "chapters":"/html/body/table/tr[1]/td[2]/table/tr[4]/td/table/tr[2]/td[2]/table[1]/tr[7]/td/font/text()", 
        "chapter_images":"",
        "vol_or_ch":"", #通过chapter/vol设置，优先话

        "all_chapters": "//a[contains(., '話')]/../a/text()",
        "all_chapters_pages": "//a[contains(., '話')]/../font/text()",
        "all_vols": "//a[contains(., '卷')]/../a/text()",
        "all_vols_pages": "//a[contains(., '卷')]/../font/text()",
        "image_base_url": "/html/body/table/tr[5]/td/a/img/@src"
    }
    sql_item = {}

    def parse_sql_item(self, response):
        print("parse sql item >>>>>>>>>>>>>>>>>>..")
        self.sql_item["mid"] = response.xpath(self.xpath.get("mid")).extract_first()
        self.sql_item["name"] = response.xpath(self.xpath.get("name")).extract_first()
        self.sql_item["author"] = response.xpath(self.xpath.get("author")).extract_first()
        self.sql_item["cover_image"] = response.xpath(self.xpath.get("cover_image")).extract_first()
        self.sql_item["cover_update_info"] = response.xpath(self.xpath.get("cover_update_info")).extract_first()
        self.sql_item["category"] = response.xpath(self.xpath.get("category")).extract_first()
        self.sql_item["summary"] = response.xpath(self.xpath.get("summary")).extract()[0]
        self.sql_item["last_update_date"] = response.xpath(self.xpath.get("last_update_date")).extract()[1]
        self.sql_item["status"] = response.xpath(self.xpath.get("status")).extract_first()
        self.sql_item["pop"] = response.xpath(self.xpath.get("pop")).extract_first()
        self.sql_item["tags"] = response.xpath(self.xpath.get("tags")).extract_first()

        chapters_len = len(response.xpath(self.xpath.get("all_chapters")).extract())
        if(chapters_len != 0):
            self.sql_item["all_chapters_len"] = chapters_len
            self.sql_item["all_chapters_pages"] = response.xpath(self.xpath.get("all_chapters_pages")).extract()
            self.sql_item["vol_or_ch"] = 0
        else:
            self.sql_item["all_chapters_len"] = len(response.xpath(self.xpath.get("all_vols")).extract())
            self.sql_item["all_chapters_pages"] = response.xpath(self.xpath.get("all_vols_pages")).extract()
            self.sql_item["vol_or_ch"] = 1

        # print(self.sql_item.get("summary"))
        for k, v in self.sql_item.items():
            if k == 'last_update_date':
                self.sql_item[k] = str.strip(v)
            elif k == "mid":
                self.sql_item[k] = int(v[v.rfind("/")+1:v.rfind(".")])
            elif k == "all_chapters_pages":
                temp = [re.findall(r"\d+", x)[0] for x in v]
                self.sql_item[k] = ','.join(temp)
            elif k == "all_chapters":
                pass
            elif k in ["name", "author", "cover_update_info", "pop", "summary", "tags"] :
                self.sql_item[k] = re.sub(r"\s+", "", v, flags=re.UNICODE)
        # print(self.sql_item)

    def start_requests(self):
        self.sqlite_file = self.settings.get("SQLITE_FILE")
        self.sqlite_table = self.settings.get("SQLITE_TABLE")
        # self.log("fuck " + self.sqlite_file + ", " + self.sqlite_table)
        self.conn = sqlite3.connect(self.sqlite_file)
        self.cur = self.conn.cursor()

        yield scrapy.Request(url=self.xpath.get("index_url")[0], callback=self.parse_all)


        # urls = self.xpath.get("urls")
        # for url in urls:
        #     yield scrapy.Request(url=url, callback=self.parse)
            # 这一步完成之后就把所有的基本信息取到，我能同时调用吗？好像不行，yield有return语义的，不能返两个return吧。。那就走parse吧，然后标记状态，完成一次之后就不再写入基本信息了


    def parse_all(self, response):
        mangas = re.findall(r"comic/\d{4}.html", str(response.body))
        if response.url.find("/comic") != 1:
            mangas = [x[6:] for x in mangas]
        # self.log(mangas)
        # 集合推导使用{}
        urls = {response.urljoin(x) for x in mangas}
        self.log(len(urls))

        # # 这样就把当前页(index_url)包含的所有漫画都爬了😯
        # for url in urls:
        #     yield scrapy.Request(url=url, callback=self.parse)


    def parse(self, response):
        # 其实这里本来每个漫画的url也就走一次吧。。。简直完美
        self.parse_sql_item(response)
        url = response.xpath(self.xpath.get("chapter")).extract_first()
        if not url:
            url = response.xpath(self.xpath.get("vol")).extract_first()
        assert url 
        first_chapter_url = response.urljoin(url)
        # self.log("fuck " + first_chapter_url)
        yield scrapy.Request(url=first_chapter_url, callback=self.parse_image_base_url)

    def parse_image_base_url(self, response):
        url = response.xpath(self.xpath.get("image_base_url")).extract_first()
        mid = self.sql_item.get("mid")
        image_base_url = url[:url.find("/"+str(mid)+"/")]
        self.sql_item["image_base_url"] = image_base_url
        # self.log(image_base_url)
        self.write_database()

    def write_database(self):
        # 这个写法确实吊，但是要注意.values()2/3表现好像不一样，3会有dictvalue之类的字符串，所以和keys一样用join连接吧，但是。。。int就跪了握草，这怎么整，转tunple就好了
        sql = 'insert into {0} ({1}) values ({2})'.format(self.sqlite_table, ', '.join(self.sql_item.keys()), ', '.join(['?'] * len(self.sql_item.keys())))
        self.log(sql)
        values = tuple(self.sql_item.values())
        self.log(values)
        self.cur.execute(sql, values)
        self.conn.commit()

    def closed(self, reason):
        if self.conn:
            self.conn.close()















