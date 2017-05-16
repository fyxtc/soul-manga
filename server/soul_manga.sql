DROP TABLE IF EXISTS soul_manga;

create table soul_manga(
    mid INTEGER not null primary key,
    name varchar(128) not null,
    author varchar(64) not null,
    cover_image varchar(64) not null,
    cover_update_info varchar(64) not null,
    category varchar(64) not null,

    summary varchar(255) not null,
    last_update_date varchar(64) not null,
    status varchar(64) not null,
    pop varchar(1) not null,

    tags varchar(128) not null, 
    all_chapters_len int not null, 
    all_chapters_pages varchar(255) not null, 
    chapter_start_index int not null,
    last_update_chapter int not null,
    last_update_vol_or_ch int not null,
    all_vols_len int not null, 
    all_vols_pages varchar(255) not null, 
    image_base_url varchar(128) not null
);



