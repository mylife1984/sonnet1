@echo off
REM "正在启动Nginx 服务器........"
cd ..
cd nginx-0.8.49
start nginx
cd ..
REM "开始启动PHP FastCGI........."
cd php-5.3.3
start RunHiddenConsole.exe php-cgi.exe -b 127.0.0.1:9000
