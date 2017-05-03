# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/en/latest/topics/items.html

import scrapy


class MangaItem(scrapy.Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    manga_name = scrapy.Field()
    chapter_name = scrapy.Field()
    image_urls = scrapy.Field()
    images = scrapy.Field()
    image_paths = scrapy.Field()

    # 有问题啊。。。这个是每一个漫画图片下载的item，下面很多信息不需要每次插入，也不要每次爬，另外写一个爬虫专门爬sqlite的吧，除了真实路径没有之外都可以办到
    # 但是！没有用，这样反而增加了爬的次数，本来最小次数就是每个图片，只要在item_completed成功一次之后不再Insert除路径/话数外的值就可以
    # sqlite main page
    name = scrapy.Field()
    author = scrapy.Field()
    tags = scrapy.Field()
    cover_image = scrapy.Field()
    cover_update_info = scrapy.Field()

    # detail page
    desc = scrapy.Field()
    last_update_date = scrapy.Field()
    detail_images = scrapy.Field()
    status = scrapy.Field() # 是否完结
    pop = scrapy.Field() # 人气
    category = scrapy.Field() # 分类和标签不一样
    chapters = scrapy.Field() # 总话数


class SqliteItem(scrapy.Item):
    # base field
    image_urls = scrapy.Field()
    images = scrapy.Field()
    image_paths = scrapy.Field()

    mid = scrapy.Field() # 就用他们的id吧，不然存图片的时候不太好找
    name = scrapy.Field()
    author = scrapy.Field()
    cover_image = scrapy.Field()
    cover_update_info = scrapy.Field()
    category = scrapy.Field()
    summary = scrapy.Field()
    last_update_date = scrapy.Field()
    status = scrapy.Field()
    pop = scrapy.Field()
    tags = scrapy.Field()
    chapters = scrapy.Field()
    chapter_pages = scrapy.Field()
    chapter_images = scrapy.Field()
    vol_or_ch = scrapy.Field()





