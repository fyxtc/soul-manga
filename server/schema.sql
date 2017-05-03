DROP TABLE IF EXISTS manga_main;
DROP TABLE IF EXISTS manga_detail;

create table manga_main(
    -- 必须用integer不能用int，才能被识别为主键自动增长
    id INTEGER not null primary key,
    -- name varchar(64) not null,
    -- image varchar(128) not null,

    -- 有可能summary要放这，如果主页显示的话
    name varchar(128) not null,
    author varchar(128) not null,
    cover_image varchar(64) not null,
    cover_update_info varchar(64) not null,
    category varchar(64) not null
);

create table manga_detail(
    -- detail 
    id INTEGER not null primary key,
    summary varchar(255) not null,
    last_update_date varchar(64) not null,
    status varchar(64) not null,
    pop int not null,

    -- 加s的都是数组
    tags varchar(128) not null, -- 先放detail吧，如果主页显示就放main
    chapters varchar(255) not null, -- 整数数组就可以，不应该记录一个最大值就可以，有的漫画有0话啥的。。先不管了，但是有可能有的中间断了的。。比如1,34这样。。放弃吧先烦，其实用逗号和images对应也不是不行。
    chapter_images varchar(64) not null, -- 这个漫画的所有图片，以|分割chapter

    -- ref
    manga_id int,
    cover_image varchar(64),
    category varchar(64) not null,
    foreign key (manga_id) references manga_main(id),
    foreign key (cover_image) references manga_main(cover_image),    
    foreign key (category) references manga_main(category)

    -- vol
    vol_or_ch not null,
);
-- 事实证明可以一次性插入。。http://www.sqlitetutorial.net/sqlite-replace-statement/,
-- 那这个就好玩了，我可以先把所有的item数据存在内存在完成的时候插入？
-- insert into manga values(null, 'name1', 'c1.png'), (null, 'name2', 'c2.png');
insert into manga_main values(null, 'name 1', 'author 1', 'c1.png', 'update to chapter 1', '1'),
                             (null, 'name 2', 'author 2', 'c2.png', 'update to chapter 2', '2'),
                             (null, 'name 3', 'author 3', 'c3.png', 'update to chapter 3', '3'),
                             (null, 'name 4', 'author 4', 'c4.png', 'update to chapter 4', '4'),
                             (null, 'name 5', 'author 5', 'c5.png', 'update to chapter 5', '5');
insert into manga_detail values(
    null, 
    'this is summary 1',
    '2011',
    'fin',
    '101',
    'fight, love',
    '1,2,3,4,5',
    'c1.png,c2.png|c3.png,c4.png',
    1,
    'c1.png',
    '1',
    0
    ),
    (null, 
    'this is summary 2',
    '2012',
    'fin',
    '102',
    'fight, love',
    '1,2,3,4,5,6',
    'c1.png,c2.png',
    2,
    'c2.png',
    '2',
    0
    ),

    (null, 
    'this is summary 3',
    '2013',
    'fin',
    '103',
    'fight, love',
    '1,2,3,4,5,6,7',
    'c1.png,c2.png',
    3,
    'c3.png',
    '3',
    0
    ),

    (null, 
    'this is summary 4',
    '2014',
    'fin',
    '104',
    'fight, love',
    '1,2,3,4,5,6,7,8',
    'c1.png,c2.png',
    4,
    'c4.png',
    '4',
    0
    ),

    (null, 
    'this is summary 5',
    '2015',
    'fin',
    '105',
    'fight, love',
    '1,2,3,4,5,6,7,8,9',
    'c1.png,c2.png',
    5,
    'c5.png',
    '5'
    );

