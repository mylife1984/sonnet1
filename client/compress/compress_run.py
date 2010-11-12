#coding=utf-8
from django.conf import settings
from compress.utils import filter_css, filter_js
import fnmatch
import os

js_files = []

def walk_all_files(root, patterns='*'):
    """遍历指定目录的全部子目录，搜索指定模式的文件。
    多个模式在patterns参数值可以用分号隔开。"""
    patterns = patterns.split(';')
    for path, subdirs, files in os.walk(root): #@UnusedVariable
        #files.sort( )
        for name in files:
            for pattern in patterns:
                if fnmatch.fnmatch(name, pattern):
                    yield os.path.join(path, name)
                    break

def get_js_files(package_filename):
    """从指定package.txt中取出js文件名"""
    global js_files
    file_object = open(package_filename)
    dir_name = os.path.dirname(package_filename)
    try:
        for line in file_object:
            line = line.rstrip()
            if line.endswith('.js'):
                if line.startswith('/'):
                    full_name = settings.APP_SOURCE_ROOT+line
                else:
                    full_name = dir_name+'//'+line
                if full_name not in js_files:
                    if settings.COMPRESS_JS_EXCLUDES:
                        ok = True
                        for exclude_str in settings.COMPRESS_JS_EXCLUDES:
                            if full_name.count(exclude_str) > 0:
                                ok = False
                                break
                        if ok:    
                            js_files.append(full_name)
                            #print full_name
                    else:
                        js_files.append(full_name)
    finally:
        file_object.close()
        
def find_js(ex_file_name):        
    for file_name in js_files:
        #print file_name
        if file_name.endswith(ex_file_name):
            return file_name
    return None
    
def get_compress_content_core():
    get_js_files(settings.APP_DIVO_SOURCE_ROOT+'//_package.txt')
    get_js_files(settings.APP_HOME_SOURCE_ROOT+'//_package.txt')
    
    #生成css列表
    css_list = []
    for css_file in walk_all_files(settings.APP_SOURCE_ROOT+'\\css', '*.css'):
        #print css_file;
        css_list.append(css_file)
    
    return (js_files,css_list)       

def get_compress_content(key):
    global js_files
    js_files = []
    paths = settings.JS_MODULES[key]
    for path in settings.COMPRESS_JS_PATHS:
        package_dir_path = os.path.join(settings.APP_MENUITEM_SOURCE_ROOT, path)
        for package_path in walk_all_files(package_dir_path, '_package.txt'):
            allow_get = False
            for ns in paths:
                if package_path.count(ns)>0:
                    allow_get = True
                    break
            if allow_get:
                #print key+":"+package_path
                get_js_files(package_path)            
    
    return js_files       

def subdirs(dir):
    return [filename for filename in os.listdir(dir)
            if os.path.isdir(os.path.join(dir, filename))]

def do_compress():
    #合并公用部分
    js_list,css_list = get_compress_content_core()
    COMPRESS_CSS = {
            'divo': {
                'source_filenames': css_list,
                'output_filename': settings.CSS_OUTPUT_ROOT+'\\divo.css',
                'bump_filename': True,
            }
     }
    
    COMPRESS_JS = {
            'app': {
                'source_filenames': tuple(js_list),
                'output_filename': settings.JS_OUTPUT_ROOT+'\\divo-debug.js',
                'bump_filename': True,
            }
    }
    
    for css in COMPRESS_CSS.values():
        filter_css(css)
    
    for js in COMPRESS_JS.values():
        filter_js(js)
        
    #合并分模块
    if not settings.VERSION.endswith('-dev'):
        for key in settings.JS_MODULES.keys():
            js_list = get_compress_content(key)
            COMPRESS_JS = {
                'app': {
                    'source_filenames': tuple(js_list),
                    'output_filename': settings.JS_OUTPUT_ROOT+'\\divo-'+key+'-debug.js',
                    'bump_filename': True,
                }
            }
            for js in COMPRESS_JS.values():
                filter_js(js)
          
        #网站风格页面对应js  
        root = os.path.join(settings.APP_SOURCE_ROOT, "pages")
        pages = subdirs(root)
        for page in pages:
            if page.startswith("."):
                continue
            
            global js_files
            js_files = []
            get_js_files(root+'//'+page+'//_package.txt')
            COMPRESS_JS = {
                'app': {
                    'source_filenames': tuple(js_files),
                    'output_filename': settings.JS_OUTPUT_ROOT+'\\pages\\'+page+'-debug.js',
                    'bump_filename': True,
                }
            }
            for js in COMPRESS_JS.values():
                filter_js(js)
            
#EOP
            
            