@echo off
REM "��������Nginx ������........"
cd ..
cd nginx-0.8.49
start nginx
cd ..
REM "��ʼ����PHP FastCGI........."
cd php-5.3.3
start RunHiddenConsole.exe php-cgi.exe -b 127.0.0.1:9000
