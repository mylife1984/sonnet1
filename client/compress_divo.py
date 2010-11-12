#coding=utf-8
import fnmatch
import os

js_files = []

def save_file(filename, contents):
    fd = open(filename, 'w+')
    fd.write(contents)
    fd.close()

def concat(filenames, separator=''):
    r = ''

    for filename in filenames:
        fd = open(filename, 'r')
        r += fd.read()
        r += separator
        fd.close()

    return r

def filter_css(css, verbose=False):
    output = concat(css['source_filenames'])

    save_file(css['output_filename'], output)

def filter_js(js, verbose=False):
    output = concat(js['source_filenames'], ';') # add a ; between each files to make sure every file is properly "closed"

    save_file(js['output_filename'], output)

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
    dir_root = os.path.abspath(os.path.split(__file__)[0])
    dir_js = os.path.join(dir_root, 'js')

    global js_files
    file_object = open(package_filename)
    dir_name = os.path.dirname(package_filename)
    try:
        for line in file_object:
            line = line.rstrip()
            if line.endswith('.js'):
                if line.startswith('/'):
                    full_name = dir_js+line
                else:
                    full_name = dir_name+'//'+line
                if full_name not in js_files:
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
    dir_root = os.path.abspath(os.path.split(__file__)[0])
    dir_core = os.path.join(dir_root, 'js', 'core')
    dir_home = os.path.join(dir_root, 'js', 'home')

    get_js_files(dir_core+'//_package.txt')
    get_js_files(dir_home+'//_package.txt')
    
    #生成css列表
    css_list = []
    for css_file in walk_all_files(dir_root+'\\css', '*.css'):
        #print css_file;
        css_list.append(css_file)
    
    return (js_files,css_list)       

def get_compress_content_app():
    dir_root = os.path.abspath(os.path.split(__file__)[0])
    dir_app = os.path.join(dir_root, 'js', 'menuitem')
    
    global js_files
    js_files = []
    for package_path in walk_all_files(dir_app, '_package.txt'):
        get_js_files(package_path)            
    
    return js_files       

def subdirs(dir):
    return [filename for filename in os.listdir(dir)
            if os.path.isdir(os.path.join(dir, filename))]

def do_compress_core():
    dir_root = os.path.abspath(os.path.split(__file__)[0])
    
    js_list,css_list = get_compress_content_core()
    COMPRESS_CSS = {
            'divo': {
                'source_filenames': css_list,
                'output_filename': dir_root+'\\divo.css',
                'bump_filename': True,
            }
     }
    
    COMPRESS_JS = {
            'app': {
                'source_filenames': tuple(js_list),
                'output_filename': dir_root+'\\divo-debug.js',
                'bump_filename': True,
            }
    }
    
    for css in COMPRESS_CSS.values():
        filter_css(css)
    
    for js in COMPRESS_JS.values():
        filter_js(js)
            
def do_compress_app():
    dir_root = os.path.abspath(os.path.split(__file__)[0])
            
    js_list = get_compress_content_app()
    COMPRESS_JS = {
        'app': {
            'source_filenames': tuple(js_list),
            'output_filename': dir_root+'\\app-debug.js',
            'bump_filename': True,
        }
    }
    for js in COMPRESS_JS.values():
        filter_js(js)
            
if __name__ == "__main__":
    do_compress_core()
    do_compress_app()
    
#EOP
            
            