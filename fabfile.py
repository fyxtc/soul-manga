from __future__ import with_statement
from fabric.api import run
from fabric.api import *
from fabric.contrib.console import confirm
from fabric.contrib.files import exists

env.hosts=['hikaru@103.80.29.187']
env.password="123123"

def npm_build():
    local("npm run build")

def clean_build_useless_images():
    with lcd("build"):
        local("rm -rf images_all images_ori psd temp-images")

def zip():
    # local("mv build soul_manga")
    local("zip -qr build.zip build server/web_server.py server/soul_manga.db server/gun_config.py")

def local_build():
    npm_build()
    clean_build_useless_images()
    zip()

def upload_to_remote():
    put("build.zip", use_sudo=True)
    # 为了mv 的非空目录....
    run("rm -rf soul_manga")
    # run("mkdir soul_manga")

    run("unzip -qo build.zip")
    # 这一步也是创建目录
    run("mv build soul_manga")
    run("mv -f server/* soul_manga/")
    run("rm -rf server")

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





