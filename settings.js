/**
 * settings
 */
exports.PATH_ROOT = __dirname;

exports.BACKEND_URL = "http://localhost:3001"

exports.DATABASES = {
    'default': {
        'NAME': __dirname+'/db.sqlite',
        'ENGINE': 'sqlite3'
    },
    'test': {
        'NAME': ':memory:',
        'ENGINE': 'sqlite3'
    }
}

//EOP
