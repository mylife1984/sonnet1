<html>
<head>
   <META http-equiv=Content-Type content="text/html; charset=utf-8">
</head>
<body>
<?php

$s='{"webname":"homehf","url":"www.homehf.com","contact":{"qq":"744348666","mail":"nieweihf@163.com","xx":"xxxxxxx"}}';
$s2='{"success": true, "data":{"is_leaf": false, "name": "\u6d88\u9632\u8f66", "display_order": 22, "tree_code": "001", "sort_order": 1, "id": 140, "code_level": 1, "parent_code": null}}';

$web=json_decode($s);
#echo '网站名称：'.$web->webname.'<br />网址：'.$web->url.'<br />联系方式：QQ-'.$web->contact->qq.'&nbsp;MAIL:'.$web->contact->mail;

$web=json_decode($s2);
echo 'success='.$web->success;

?> 
</body>
</html>
