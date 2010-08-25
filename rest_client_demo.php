<html>
<head>
   <META http-equiv=Content-Type content="text/html; charset=utf-8">
</head>
<body>

<?php
require_once('gam-http/http.php');

class Timer
{
    private static $_start = null;

    static function start()
    {
        $mtime = microtime();
        $mtime = explode(' ', $mtime);
        $mtime = $mtime[1] + $mtime[0];
        self::$_start = $mtime;
    }

    static function end()
    {
        $mtime = microtime();
        $mtime = explode(" ", $mtime);
        $mtime = $mtime[1] + $mtime[0];
        $endtime = $mtime;
        return ($endtime - self::$_start);
    }
}

#-- 同步调用
Timer::start();
$out = Http::connect('localhost')
    ->silentMode()
    ->get('/dev/sonnet1/sleep.php', array('sleep' => 3))
    ->post('/dev/sonnet1/sleep.php', array('sleep' => 2))
    ->get('/dev/sonnet1/sleep.php', array('sleep' => 2))
    ->post('/dev/sonnet1/sleep.php', array('sleep' => 2))
    ->get('/dev/sonnet1/sleep.php', array('sleep' => 2))
    ->post('/dev/sonnet1/sleep.php', array('sleep' => 2))
    ->get('/dev/sonnet1/sleep.php', array('sleep' => 1))
    ->run();
echo '---------- 异步调用结果（同一个域名）：<br/>';
print_r($out);
echo '<p>This page was created in ' . Timer::end() . ' seconds.</p>';

Timer::start();

$out = Http::multiConnect()
    ->add(Http::connect('localhost')->get('/dev/sonnet1/sleep.php', array('sleep' => 3)))
    ->add(Http::connect('localhost')->post('/dev/sonnet1/sleep.php', array('sleep' => 2)))
    ->add(Http::connect('localhost')->get('/dev/sonnet1/sleep.php', array('sleep' => 2)))
    ->add(Http::connect('localhost')->post('/dev/sonnet1/sleep.php', array('sleep' => 2)))
    ->add(Http::connect('localhost')->get('/dev/sonnet1/sleep.php', array('sleep' => 2)))
    ->add(Http::connect('localhost')->post('/dev/sonnet1/sleep.php', array('sleep' => 2)))
    ->add(Http::connect('localhost')->get('/dev/sonnet1/sleep.php', array('sleep' => 1)))
    ->run();
echo '---------- 异步调用结果（每个调用可以用不同的域名）：<br/>';
print_r($out);
echo '<p>This page was created in ' . Timer::end() . ' seconds.</p>';

Timer::start();
echo '---------- 单个同步调用（3）：<br/>';
echo Http::connect('localhost')
    ->doGet('/dev/sonnet1/sleep.php', array('sleep' => 3));
echo '<p>This page was created in ' . Timer::end() . ' seconds.</p>';

Timer::start();    
echo '---------- 单个同步调用（2）：<br/>';
echo Http::connect('localhost')
    ->doPost('/dev/sonnet1/sleep.php', array('sleep' => 2));
echo '<p>This page was created in ' . Timer::end() . ' seconds.</p>';

Timer::start();
echo '---------- 单个同步调用（1）：<br/>';
echo Http::connect('localhost')
    ->doDelete('/dev/sonnet1/sleep.php', array('sleep' => 1));
echo '<p>This page was created in ' . Timer::end() . ' seconds.</p>';

echo '---------- 捕获异常：<br/>';
Timer::start();    
try {
   echo Http::connect('localhost')
        ->doGet('/dev/sonnet1/sleep2.php', array('sleep' => 3));
} catch (Http_Exception $e) {
    switch ($e) {
        case Http_Exception::INTERNAL_ERROR:
            echo "Internal Error";
            break;
    }
}
echo '<p>This page was created in ' . Timer::end() . ' seconds.</p>';
?>
</body>
</html>

