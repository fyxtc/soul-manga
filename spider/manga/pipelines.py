# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: http://doc.scrapy.org/en/latest/topics/item-pipeline.html


import scrapy
from scrapy.pipelines.images import ImagesPipeline
from scrapy.exceptions import DropItem
import os
import manga.settings
import sqlite3

class MangaPipeline(ImagesPipeline):
    def __init__(self, sqlite_file, sqlite_table_main, sqlite_table_detail):
        self.sqlite_file = sqlite_file
        self.sqlite_table_main = sqlite_table_main
        self.sqlite_table_detail = sqlite_table_detail

    @classmethod
    def from_crawler(cls, crawler):
        # 调用cls来创建自己，只有这一种方式能hook自己定义的东西，属于依赖注入应该
        return cls(sqlite_file=crawler.settings.get('SQLITE_FILE'), sqlite_table_main=crawler.settings.get('SQLITE_TABLE_MAIN'), sqlite_table_detail=crawler.settings.get("SQLITE_TABLE_DETAIL"))

    def open_spider(self, spider):
        self.conn = sqlite3.connect(self.sqlite_file)
        self.cur = self.conn.cursor()

    def close_spider(self, spider):
        self.conn.close()

    # 我感觉，写入的操作应该在completed的时候把，因为这个时候才是我存储的路径，直接用源是不行的，我是通过react的js生成的img，会造成cor
    # def process_item(self, item, spider):
    #     sql = ""
    #     self.cur.execute(sql, )

    def get_media_requests(self, item, info):
        for image_url in item['image_urls']:
            yield scrapy.Request(image_url)

    def item_completed(self, results, item, info):
        image_paths = [x['path'] for ok, x in results if ok]
        urls = [x['url'] for ok, x in results if ok]
        if not image_paths:
            raise DropItem("Item contains no images")
        item['image_paths'] = image_paths

        old_name = os.path.abspath(image_paths[0])
        # 默认放在项目的full下，需要修改哦
        # # rename也是可以移动文件到另一个文件夹的
        old_name = os.path.join(manga.settings.IMAGES_STORE, "full", os.path.basename(old_name))
        target_dir = os.path.join(manga.settings.IMAGES_STORE, item.get("manga_name"), item.get("chapter_name"))
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)

        target_name = os.path.join(target_dir, os.path.basename(urls[0]))  
        # 如果指定了--logfile或者配置了LOG_FILE，那么所有日志都会写到文件，屏幕上只会留下print，也许这才是我想要的，不然太烦了。。。
        print("finished " + target_name)
        os.rename(old_name, target_name)


        # save to sqlite
        # todo： 修改路径，以及自定义导入的参数，并不需要item的所有field
        # 简单暴力的第一次成功之后，所有的除了真是路径和话数之外，其他都不需要做Insert了
        # insert_data = {
        #     # main page
        #     'name': item.get(manga_name), 
        #     'author': 'hikaru',
        #     'tags': 'fight',
        #     'cover_image': target_name,
        #     'cover_update_info': 'update to 1',

        #     # detail page
        #     'desc': 'this is desc',
        #     'last_update_date': '2017',
        #     'detail_images': 
        # }
        # sql = 'insert into {0} ({1}) values ({2})'.format(self.sqlite_table, ', '.join(item.fields.keys()), ', '.join(['?'] * len(item.fields.keys())))
        # self.cur.execute(sql, item.fields.values())
        # self.conn.commit()
        self.write_database(urls[0])

        return item

    def write_database(self, origin_name):
        print("origin_name: " + origin_name)










