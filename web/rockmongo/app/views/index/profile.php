<h3><?php render_navigation($db); ?> &raquo; <?php hm("profile"); ?></h3>

<div class="operation">
	<a href="<?php h(url("profile", array("db"=>$db))); ?>" class="current"><?php hm("profile"); ?></a> | <a href="<?php h(url("profileLevel", array("db"=>$db))); ?>">Change level</a> |
	<a href="<?php h(url("clearProfile", array("db"=>$db))); ?>" onclick="return window.confirm('Are you sure to clear profile on db \'<?php h($db); ?>\'?')"><?php hm("clear"); ?></a> 
</div>

<p class="page"><?php h($page); ?></p>

<?php foreach ($rows as $row): ?>
<div style="border:2px #ccc solid;margin-bottom:5px;">
	Date:<?php h(date("Y-m-d H:i:s", $row["ts"]->sec));?><br/>
	<?php h($row["text"]);?>
</div>
<?php endforeach; ?>

<p class="page"><?php h($page); ?></p>