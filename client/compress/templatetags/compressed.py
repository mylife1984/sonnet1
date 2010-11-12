import os

from django.utils.http import urlquote

from django import template

from django.conf import settings as django_settings

from django.conf import settings
from compress.utils import media_root

register = template.Library()

def render_common(template_name, obj, filename):
    if 'extra_context' in obj:
        context = obj['extra_context']
    else:
        context = {}
    
    url = django_settings.MEDIA_URL + urlquote(filename)

    if settings.COMPRESS and 'bump_filename' in obj and obj['bump_filename']:
        try:
            url += '?%d' % os.stat(media_root(filename)).st_mtime
        except:
            # do not output specified file if stat() fails
            # the URL could be cached forever at the client
            # this will (probably) make the problem visible, while not aborting the entire rendering
            return ''

    context.update(url=url)
    return template.loader.render_to_string(template_name, context)

def render_css(css, filename):
    try:
        template_name = css['template_name']
    except KeyError:
        template_name = 'compress/css.html'
        
    return render_common(template_name, css, filename)

def render_js(js, filename):
    try:
        template_name = js['template_name']
    except KeyError:
        template_name = 'compress/js.html'

    return render_common(template_name, js, filename)

class CompressedCSSNode(template.Node):
    def __init__(self, name):
        self.name = name

    def render(self, context):
        css_name = template.Variable(self.name).resolve(context)

        try:
            css = settings.COMPRESS_CSS[css_name]
        except KeyError:
            return '' # fail silently, do not return anything if an invalid group is specified

        if settings.COMPRESS:
            return render_css(css, css['output_filename'])
        else:
            # output source files
            r = ''
            for source_file in css['source_filenames']:
                r += render_css(css, source_file)

            return r

class CompressedJSNode(template.Node):
    def __init__(self, name):
        self.name = name

    def render(self, context):
        js_name = template.Variable(self.name).resolve(context)
        
        try:
            js = settings.COMPRESS_JS[js_name]
        except KeyError:
            return '' # fail silently, do not return anything if an invalid group is specified

        if settings.COMPRESS:
            return render_js(js, js['output_filename'])
        else:
            # output source files
            r = ''
            for source_file in js['source_filenames']:
                r += render_js(js, source_file)
            return r

#@register.tag
def compressed_css(parser, token):
    try:
        tag_name, name = token.split_contents() #@UnusedVariable
    except ValueError:
        raise template.TemplateSyntaxError, '%r requires exactly one argument, being the name of the COMPRESS_CSS setting'

    return CompressedCSSNode(name)
compressed_css = register.tag(compressed_css)

#@register.tag
def compressed_js(parser, token):
    try:
        tag_name, name = token.split_contents() #@UnusedVariable
    except ValueError:
        raise template.TemplateSyntaxError, '%r requires exactly one argument, being the name of the COMPRESS_JS setting'

    return CompressedJSNode(name)
compressed_js = register.tag(compressed_js)
