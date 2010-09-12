<script language="javascript">
/**
 * highlight current collection being viewed
 *
 * @param string name collection name
 */
function highlightCollection(name) {
	var collections = $(".collections");
	collections.find("li").each(function () {
		var a = $(this).find("a");
		if (a.attr("cname") == name) {
			a.css("font-weight", "bold");
			a.css("color", "blue");
		}
		else {
			a.css("font-weight", "normal");
			a.css("color", "");
		}
	});
}

</script>

<div style="background-color:#eeefff;height:100%">
	<div style="margin-left:20px"><img src="images/server.png" align="absmiddle" width="14"/> <a href="<?php h(url("server"));?>" target="right"><?php hm("server"); ?></a></div>
	<div style="margin-left:20px;margin-bottom:3px;"><img src="images/world.png" align="absmiddle" width="14"/> <a href="<?php h(url("databases"));?>" target="right">Overview</a></div>
	<div style="margin-bottom:10px;border-bottom:1px #ccc solid"></div>
	<ul class="dbs">
		<?php foreach ($dbs as $db) : ?>
		<li><a href="<?php echo $baseUrl;?>&db=<?php h($db["name"]);?>" <?php if ($db["name"] == x("db")): ?>style="font-weight:bold"<?php endif;?> onclick="window.parent.frames['right'].location='<?php h(url("db",array("db"=>$db["name"])));?>'"><img src="images/database.png" align="absmiddle" width="14"/> <?php echo $db["name"];?></a><?php if($db["collectionCount"]>0):?> (<?php h($db["collectionCount"]); ?>)<?php endif;?>
			<ul class="collections">
				<?php if($db["name"] == x("db")): ?>
					<?php if (!empty($tables)):?>
						<?php foreach ($tables as $table => $count) :?>
						<li><a href="<?php h(url("collection", array( "db" => $db["name"], "collection" => $table ))); ?>" target="right" cname="<?php h($table);?>"><img src="images/<?php if(preg_match("/\.(files|chunks)$/",$table)){h("grid");}else{h("table");} ?>.png" width="14" align="absmiddle"/> <?php h($table);?></a> (<?php h($count);?>)</li>
						<?php endforeach; ?>
					<?php else:?>
						<li>No collections yet</li>
					<?php endif;?>
				<?php endif; ?>
				<?php if ($db["name"] == x("db")):?>
				<li><a href="<?php h(url("newCollection", array( "db" => $db["name"] ))); ?>" target="right" title="create new collection in db"><img src="images/add.png" width="14" align="absmiddle"/> Create &raquo;</a></li>
				<?php endif;?>
			</ul>
		</li>
		<?php endforeach; ?>
	</ul>
	<div style="height:40px"></div>
</div>