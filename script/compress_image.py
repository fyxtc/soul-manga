#coding=utf-8
import random
import sys
import struct
import os
import stat
import shutil

COMPRESS_RESULT = ""
# 请在tools目录下运行
IN_FOLDER = "../public/images_ori"
OUT_FOLDER = "../public/images"

def deal_file(path, func):
    if os.path.isfile(path):
        func(path)
    else:
        for item in os.listdir(path):
            subpath = os.path.join(path, item)
            mode = os.stat(subpath)[stat.ST_MODE]
            if stat.S_ISDIR(mode):
                deal_file(subpath, func)
            else: 
                func(subpath)


def compress(in_file):
    global COMPRESS_RESULT
    # gif不能转。。。
    # 这里还有一个问题，如果ps已经存储为web格式了，这里不能再跑了，不然有的会特么更大...
    ps_web = ["luffy_naruto.jpg", "snow.png", "op.jpg", "logo.png"]
    if (in_file.find(".png") != -1 or in_file.find(".jpg") != -1) and os.path.basename(in_file) not in ps_web:
        out_file = in_file.replace(IN_FOLDER, OUT_FOLDER)
        out_dir = os.path.dirname(out_file)
        if not os.path.exists(out_dir):
            os.makedirs(out_dir)
        cmd = "pngquant --force --speed 1 --verbose 256 --output " +  out_file  + " " + in_file
        print(cmd)

        res = os.system(cmd)
        if res != 0:
            COMPRESS_RESULT += in_file + "    "
    else:
        copy_other(in_file)

def copy_other(in_file):
    # copy other resource
    out_file = in_file.replace(IN_FOLDER, OUT_FOLDER)
    path = os.path.dirname(out_file)
    if(not os.path.exists(path)):
        os.makedirs(path)

    cmd = "cp -f " + in_file + " " + out_file
    print(cmd)
    os.system(cmd)


def print_compress_result() :
    if COMPRESS_RESULT != "":
        print("\nERROR OCCURED WHEN COMPRESSED FILE: " + COMPRESS_RESULT)
    else:
        print("\nSCRIPT FINISHED SUCCESSFULLY!!!")

if __name__ == "__main__":
    # if os.path.exists(OUT_FOLDER):
    #     shutil.rmtree(OUT_FOLDER)
    # os.makedirs(OUT_FOLDER)

    deal_file(IN_FOLDER, compress)
    print_compress_result()


