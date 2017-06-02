from __future__ import with_statement
from fabric.api import run
from fabric.api import *
from fabric.contrib.console import confirm
from fabric.contrib.files import exists

env.hosts=['root@103.80.29.187']
env.password="123123"


KEEP_DB_AND_GUN_CONFIG_AND_SITEMAP = True
# KEEP_DB_AND_GUN_CONFIG_AND_SITEMAP = False

def npm_build():
    local("npm run build")

def clean_build_useless_images():
    with lcd("build"):
        local("rm -rf images_all images_ori psd temp-images")

def zip():
    # local("mv build soul_manga")
    # 默认只放入client/server code，因为vps上crontab在自己运行会更新db，用本地反而有问题,config 一般也不会改，我曹，不行
    # todo 卧槽！！！这里有大问题，如果下面是用rm -rf soul_manga的话，这两个文件都得跪，要不先在vps rm之前先保存到~然后再移动回去？
    # local("zip -qr build.zip build server/web_server.py server/soul_manga.db server/gun_config.py")

    if KEEP_DB_AND_GUN_CONFIG_AND_SITEMAP:
        local("zip -qr build.zip build server/web_server.py ")
    else:
        local("zip -qr build.zip build server/web_server.py server/soul_manga.db server/gun_config.py server/sitemap.txt")


def local_build():
    npm_build()
    clean_build_useless_images()
    zip()

def upload_to_remote():
    put("build.zip", use_sudo=True)
    # 为了mv 的非空目录....
    if KEEP_DB_AND_GUN_CONFIG_AND_SITEMAP:
        run("cp -f soul_manga/soul_manga.db soul_manga/gun_config.py soul_manga/sitemap.txt ~/")
    run("rm -rf soul_manga")
    # run("mkdir soul_manga")

    run("unzip -qo build.zip")
    # 这一步也是创建目录
    run("mv build soul_manga")
    run("mv -f server/* soul_manga/")
    run("rm -rf server")

    if KEEP_DB_AND_GUN_CONFIG_AND_SITEMAP:
        run("mv soul_manga.db gun_config.py sitemap.txt ~/soul_manga")

def start_gunicorn():
    run("gun")


def deploy():
    local_build()
    upload_to_remote()

    restart_gun()
    # restart_nginx()

    # print("IF NEED, open restart gunicorn & nginx")

def restart_gun():
    if exists("gun.pid"):
        pid = run("cat gun.pid")
        cmd = "kill " + pid
        run(cmd)
    with cd("soul_manga"):
        run("gunicorn -c gun_config.py web_server:app")


def restart_nginx():
    run("nre")





