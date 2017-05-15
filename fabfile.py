from __future__ import with_statement
from fabric.api import run
from fabric.api import *
from fabric.contrib.console import confirm

env.hosts=['hikaru@103.80.29.187']
env.password="123123"

def npm_build():
    local("npm run build")

def clean_build_useless_images():
    with lcd("build"):
        local("rm -rf images_all images_ori psd temp-images")

def zip():
    # local("mv build soul_manga")
    local("zip -qr build.zip build server/web_server.py server/soul_manga.db")

def local_build():
    # npm_build()
    # clean_build_useless_images()
    zip()

def upload_to_remote():
    put("build.zip", use_sudo=True)
    # run("rm -rf soul_manga")
    run("unzip -q build.zip")
    run("mv build soul_manga")
    run("mv server/* soul_manga/")
    run("rm -rf server")

def start_server():
    run("gun")


def deploy():
    local_build()
    upload_to_remote()

    # if need, open it
    # restart_gun()
    # restart_nginx()

    print("IF NEED, open restart gunicorn & nginx")

def restart_gun():
    # todo 如果没起来。。需要启动。。。nginx也一样
    with cd("soul_manga"):
        # run("pwd")
        pid = run("cat gun.pid")
        cmd = "kill -HUP " + pid
        run(cmd)

def restart_nginx():
    run("nre")





