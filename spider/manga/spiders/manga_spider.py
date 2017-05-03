import scrapy
from manga.settings import *
import sys
import logging

# javascript:alert($(document).unbind("contextmenu",""));

XPATH_MAP = {
    "eh":{
        "urls": ["https://"],
        "cur_page": "//div[@class='gdtm']/div/a/@href", 
        "next_page": "//div[@class='gtb']/table/tr/td[last()]/a/@href", 
        "img_parse": "//img[@id='img']/@src"
    },
    "cartomad":{
        
        # Missing scheme in request url: h 是urls必须是List而不是str,而且这个url结果不许加"/"..奇怪 
        # 以这两个规则为例:
        # @app.route('/projects/')
        # def projects():
        #     return 'The project page'
        # @app.route('/about')
        # def about():
        #     return 'The about page'
        # 虽然它们看起来着实相似，但它们结尾斜线的使用在 URL 定义 中不同。 第一种情况中，指向 projects 的规范 URL 尾端有一个斜线。这种感觉很像在文件系统中的文件夹。
        # 访问一个结尾不带斜线的 URL 会被 Flask 重定向到带斜线的规范 URL 去。
        # 然而，第二种情况的 URL 结尾不带斜线，类似 UNIX-like 系统下的文件的路径名。访问结尾带斜线的 URL 会产生一个 404 “Not Found” 错误。
        # 这个行为使得在遗忘尾斜线时，允许关联的 URL 接任工作，与 Apache 和其它的服务器的行为并无二异。此外，也保证了 URL 的唯一，有助于避免搜索引擎索引同一个页面两次。
        "urls": ["http://www.cartoonmad.com/comic/1079.html"],
        "cur_page": "//a[contains(., '話')]/@href",  # 默认下载话
        "cur_page_over": "//a[contains(., '卷')]/@href",
        "detail_page": "//option[contains(., '頁')]/@value",  
        "img_parse": "//img[contains(@src, 'cartoonmad.com')]/@src",
        "over_tag": "//img/@src[contains(., 'chap9.gif')]",
        "continued_tag": "//img/@src[contains(., 'chap1.gif')]",
    },
    "dmzj":{
        "cur_page": "", 
        "next_page": "", 
        "img_parse": "//div[@id='center_box']/img/@src",
    },
    "ikanman":{
        "urls": ["http://tw.ikanman.com/comic/2801/"],
        # tr[* = 'X']/following-sibling::tr[1]
        "cur_page": "//span[contains(., '回') and ./i[contains(., 'p')]]/../@href", 
        "next_page": "", 
        "img_parse": "//img[@id='mangaFile']/@src",
        # "not_url_join":True
    },
}
XPATH_TYPE = "cartomad"

class MangaSpider(scrapy.Spider):
    name = "manga"
    data = XPATH_MAP.get(XPATH_TYPE);
    # start_urls = ["https://e-hentai.org/g/1052044/71cffc9098/"]

    # def __init__(self):
    #     self.headers = HEADERS

    def start_requests(self):
        self.log(self.data.get("urls"))
        urls = self.data.get("urls")
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        # current page
        cur_xpath = self.data.get("cur_page")
        # if(self.is_exist_over_tag(response)):
        #     cur_xpath = self.data.get("cur_page_over")
        srcs= response.xpath(cur_xpath).extract()
        # srcs = [response.urljoin(x) for x in srcs]
        # for src in srcs:
        #     yield scrapy.Request(url=src, callback=self.parse_detail)
        #     break; # test cut

        # next page
        # srcs = response.xpath(data.get("next_page")).extract()
        # for src in srcs:
        #     yield scrapy.Request(url=src, callback=self.parse)

        # 为毛方法进不去。。妈的打日志都没反应，难道是需要加上yield？不是，是需要加上return，那相当于只能执行一次了。。。复用蛋蛋
        return self.get_new_req(srcs, self.parse_detail, response)
        # self.get_new_req(next_srcs, self.parse)

    def parse_detail(self, response):
        # 第一页被去重，所以这里直接下载这个第一页，但是这里必须用yield，不然根本进入不到pipeline，握草
        yield self.parse_image(response)
        srcs = response.xpath(self.data.get("detail_page")).extract()
        srcs = [response.urljoin(x) for x in srcs]
        for src in srcs:
            yield scrapy.Request(url=src, callback=self.parse_image) 

    def get_new_req(self, srcs, callback, response):
        # self.log(srcs)
        srcs = [response.urljoin(x) for x in srcs]
        for src in srcs:
            yield scrapy.Request(url=src, callback=callback)

    def parse_image(self, response):
        srcs = response.xpath(self.data.get("img_parse")).extract()
        self.log(srcs)
        title = response.xpath("//title/text()").extract_first().split("-")
        manga_name = title[0].split(" ")[0]
        chapter_name = title[1]

        # 这个的logger的tag是spider的name，下面的全局则显示root
        self.logger.info("downloading " + manga_name + ": " + chapter_name)
        # logging.info("downloading " + manga_name + ": " + chapter_name)

        # 原来可以直接构造时候赋值，666
        # item = MangaItem(image_urls=srcs, ...)
        item = MangaItem()
        item["image_urls"] = srcs
        item["chapter_name"] = chapter_name.strip()
        item["manga_name"] = manga_name
        return item

    def is_exist_over_tag(self, resp):
        is_over = len(resp.xpath(self.data.get("over_tag")).extract()) > 0
        return is_over

