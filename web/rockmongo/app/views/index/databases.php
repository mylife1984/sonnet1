<div class="operation">
	<?php render_server_ops("databases"); ?>
</div>

 <a href="<?php h(url("createDatabase")); ?>"><?php hm("create_database"); ?></a>

<table bgcolor="#cccccc" cellpadding="2" cellspacing="1" width="600">
	<tr>
		<th>Name</th>
		<th>Size</th>
		<th nowrap>Storage Size</th>
		<th nowrap>Data Size</th>
		<th nowrap>Index Size</th>
		<th>Collections</th>
		<th>Objects</th>
	</tr>
	<?php foreach ($dbs as $db):?>
	<tr bgcolor="#fffeee">
		<td width="120" valign="top"><a href="<?php h(url("db", array("db"=>$db["name"]))); ?>"><?php h($db["name"]);?></a></td>
		<td width="80"><?php h($db["diskSize"]);?></td>
		<td width="80"><?php h($db["storageSize"]);?></td>
		<td width="80"><?php h($db["dataSize"]);?></td>
		<td width="80"><?php h($db["indexSize"]);?></td>
		<td width="80"><?php h($db["collections"]);?></td>
		<td><?php h($db["objects"]);?></td>
	</tr>
	<?php endforeach; ?>
</table>
