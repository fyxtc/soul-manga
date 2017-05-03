import scrapy
from manga.settings import *
import sys
import logging
from manga.items import MangaItem

class EhSpider(scrapy.Spider):
    name = "eh"
    xpath = {
        "urls": ["https://e-hentai.org/g/1052044/71cffc9098/"],
        "image_page": "//div[@class='gdtm']/div/a/@href", 
        "next_page": "//div[@class='gtb']/table/tr/td[last()]/a/@href", 
        "image": "//img[@id='img']/@src"
    }

    def start_requests(self):
        urls = self.xpath.get("urls")
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        srcs = response.xpath(self.xpath.get("image_page")).extract()
        srcs = [response.urljoin(x) for x in srcs]
        for src in srcs:
            yield scrapy.Request(url=src, callback=self.parse_image_page)

        srcs = response.xpath(self.xpath.get("next_page")).extract()
        for src in srcs:
            yield scrapy.Request(url=src, callback=self.parse)


    def parse_image_page(self, response):
        srcs = response.xpath(self.xpath.get("image")).extract()
        self.log(srcs)
        manga_name = response.xpath("//h1/text()").extract_first()
        # chapter_name = title[1].strip()

        logging.info("downloading " + manga_name)

        item = MangaItem(image_urls=srcs, manga_name=manga_name, chapter_name="")
        # item["image_urls"] = srcs
        # item["chapter_name"] = chapter_name
        # item["manga_name"] = manga_name
        return item


