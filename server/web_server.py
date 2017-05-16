from flask import Flask, jsonify, url_for, g, render_template
from datetime import timedelta
from flask import make_response, request, current_app
from functools import update_wrapper
from flask_cors import CORS, cross_origin
import sqlite3
from flask_compress import Compress


PAGE_SIZE = 2 * 6 # 一行6个现在
FIRST_PAGE_SIZE = 2 * PAGE_SIZE # 首页给四行

def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, str):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, str):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator

app = Flask(__name__)
CORS(app)
Compress(app)

@app.route('/')
@crossdomain(origin='*')
def home():
    # resp = {
    #     "res":
    #     [ 
    #         {
    #             'id': 0,
    #             'title': 'title1',
    #             'image': 'c1.png'
    #         },
    #         {
    #             'id': 1,
    #             'title': 'title2',
    #             'image': 'c2.png'
    #         },
    #     ]
    # }
    print("fuck home ")
    res = query_db("select * from soul_manga")
    # print(res)
    return jsonify(res)

@app.route('/category')
@app.route('/category/<int:cid>')
@app.route('/category/<int:cid>/<int:page>')
# 这行的/是为了nginx转发过的，结尾有带/，所以py也得加
@app.route('/category/<int:cid>/<int:page>/')
def soul_manga(cid=1, page=0):
    print("category {0}, page {1}, limit {2} ".format(cid, page, FIRST_PAGE_SIZE + page * PAGE_SIZE))
    sql = "select * from soul_manga where category = ? limit ? offset ?"
    # target_count = FIRST_PAGE_SIZE + page * PAGE_SIZE #这个计算不对吧。。这是全部了...
    target_count = FIRST_PAGE_SIZE if page == 0 else PAGE_SIZE
    if page > 0:
        offset = FIRST_PAGE_SIZE + (page-1) * PAGE_SIZE
    else:
        offset = 0
    params = [cid, target_count, offset]
    if cid == 15: # 全部
        sql = "select * from soul_manga limit ? offset ?"
        params = params[1:]

    res = {}
    res["data"] = query_db(sql, params)
    res["over"] = len(res.get("data")) < target_count 
    res["category"] = cid
    # print(res.get("data"))
    print("over: " + str(res.get("over")) + " " + str(len(res.get("data"))) + " & " + str(target_count))
    return jsonify(res)



@app.route('/info/<int:mid>')
@app.route('/info/<int:mid>/')
def info(mid=1):
    print("fuck id " + str(mid))
    res = query_db("select * from soul_manga where mid = ?", [mid], True)
    print(res)
    return jsonify(res)

# @app.route('/read/<int:mid>')
@app.route('/read/<int:mid>/chapter/<int:chapter>')
@app.route('/read/<int:mid>/chapter/<int:chapter>/')
def read_chapter(mid, chapter=1):
    print('read id {0} chapter {1}'.format(mid, chapter))
    chapter_images = query_db("select image_base_url, all_chapters_pages from soul_manga where mid = ?", [mid], True)
    # print(chapter_images)
    if chapter_images:
        # todo check
        res = {}
        res["image_base_url"] = chapter_images.get("image_base_url")
        res["cur_ch_pages"] = chapter_images.get('all_chapters_pages').split(",")[chapter-1]
        # print(res)
        return jsonify(res)
    else:
        return jsonify({})

@app.route('/read/<int:mid>/vol/<int:vol>')
@app.route('/read/<int:mid>/vol/<int:vol>/')
def read_vol(mid, vol=1):
    print('read id {0} vol {1}'.format(mid, vol))
    vol_images = query_db("select image_base_url, all_vols_pages from soul_manga where mid = ?", [mid], True)
    # print(vol_images)
    if vol_images:
        # todo check
        res = {}
        res["image_base_url"] = vol_images.get("image_base_url")
        res["cur_ch_pages"] = vol_images.get('all_vols_pages').split(",")[vol-1]
        # print(res)
        return jsonify(res)
    else:
        return jsonify({})

@app.route("/search/<string:key>")
@app.route("/search/<string:key>/")
def search(key):
    if key:
        sql = "select * from soul_manga where name like '%{0}%'".format(key) 
        print("search key: " + key + ", sql: " + sql)
        res = {}
        # res = query_db(sql)
        res["data"] = query_db(sql)
        res["key"] = key
        return jsonify(res)
    # else:
    #     return jsonify({})

DATABASE = './soul_manga.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

# def query_db(query, args=(), one=False):
#     cur = get_db().execute(query, args)
#     rv = cur.fetchall()
#     cur.close()
#     return (rv[0] if rv else None) if one else rv

def query_db(query, args=(), one=False):
    with app.app_context():
        cur = get_db().execute(query, args)
        rv = [dict((cur.description[idx][0], value)
                   for idx, value in enumerate(row)) for row in cur.fetchall()]
        return (rv[0] if rv else None) if one else rv

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('soul_manga.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

def insert_db(sql):
    with app.app_context():
        get_db().execute(sql)
        get_db().commit()


if __name__ == '__main__':
    app.run(debug=False,  JSONIFY_PRETTYPRINT_REGULAR=False)
























