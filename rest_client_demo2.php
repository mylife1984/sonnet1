<html>
<head>
   <META http-equiv=Content-Type content="text/html; charset=utf-8">
</head>
<body>

<?php
require_once('gam-http/http.php');

$out = Http::connect('my.sh70119.com')
    ->doGet('/xf/productcats/001');
echo $out;

#注意：JSON串中不能出现单引号。例如，下面的JSON值不能转换：
# {'success': true, 'data':{"is_leaf": false, "name": "\u6d88\u9632\u8f66", ...

$json = json_decode(str_replace("'",'"',$out));
echo "<br/>json=";
echo $json->success.$json->data->name;

?>
</body>
</html>

