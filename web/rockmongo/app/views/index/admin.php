<html>
 <head>
 <title>RockMongo</title>
 <script language="javascript" src="js/jquery-1.4.2.min.js"></script>
 <style type="text/css">
* {font-size:12px; font-family:'Courier New', Arial}
body {margin:0; padding:0}
a { text-decoration:none; color:#004499; line-height:1.5 }

.manual, .server-menu {
  float:right;
  margin-right:100px;
  margin-top:0px;
  background-color:#eee;
  border-left:1px #ccc solid;
  border-top:1px #ccc solid;
  border-right:2px #ccc solid;
  border-bottom:2px #ccc solid;
  padding-left:3px;
  position:absolute;
  display:none;
  width:100px;
}
</style>
<script language="javascript">
/** show manual links **/
function setManualPosition(className, x) {
	if ($(className).is(":visible")) {
		$(className).hide();
	}
	else {
		window.setTimeout('$("' + className + '").show().css("left", ' + x + ' - 2)', 100);
		$(className).find("a").click(function () {
			hideMenus();
		});
	}
}
 
/** hide menus **/
function hideMenus() {
	$(".manual").hide();
	$(".server-menu").hide();
}
</script>
 </head>
<body style="overflow:hidden">
<div>
	<iframe src="<?php echo $topUrl;?>" name="top" width="100%" frameborder="no" height="20" marginheight="0" scrolling="no"></iframe> 
</div>
<div class="manual"">
	<a href="http://www.mongodb.org/display/DOCS/Advanced+Queries" target="_blank">Querying</a><br/>
	<a href="http://www.mongodb.org/display/DOCS/Updating" target="_blank">Updating</a><br/>
	<a href="http://www.mongodb.org/display/DOCS/List+of+Database+Commands" target="_blank">Commands</a><br/>
	<a href="http://api.mongodb.org/js/" target="_blank">JS API</a><br/>
	<a href="http://www.php.net/manual/en/book.mongo.php" target="_blank">PHP Mongo</a>
</div>
<div class="server-menu">
	<a href="<?php h(url("server")); ?>" target="right"><?php hm("server"); ?></a><br/>
	<a href="<?php h(url("status")); ?>" target="right"><?php hm("status"); ?></a> <br/>
	<a href="<?php h(url("databases")); ?>" target="right"><?php hm("databases"); ?></a> <a href="<?php h(url("createDatabase")); ?>" target="right" title="Create new Database">[+]</a> <br/>
	<a href="<?php h(url("processlist")); ?>" target="right"><?php hm("processlist"); ?></a> <br/>
	<a href="<?php h(url("command")); ?>" target="right"><?php hm("command"); ?></a> <br/>
	<a href="<?php h(url("execute")); ?>" target="right"><?php hm("execute"); ?></a> <br/>
	<a href="<?php h(url("replication")); ?>" target="right"><?php hm("master_slave"); ?></a> 
</div>
<div style="float:left;width:19%;height:100%;border-right:1px #ccc solid;background-color:#eeefff;">
	<iframe src="<?php echo $leftUrl;?>" name="left" width="100%" height="100%" frameborder="no" scrolling="auto" marginheight="0"></iframe>
</div> 
<div style="float:left;margin-left:10px;width:80%;height:95%">
	<iframe src="<?php echo $rightUrl;?>" name="right" width="100%" height="100%" frameborder="no" marginheight="0" scrolling="auto"></iframe>
</div>

</body>
</html>