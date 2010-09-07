<h3><?php render_navigation($db); ?> &raquo; Drop Database</h3>

<p style="font-size:14px">
	Caution again:are you sure to drop database <?php h($db);?>?
</p>
<p style="font-size:14px">
	All data in the db will be lost!
</p>
<input type="button" value="Yes" onclick="window.location='<?php h(url("dropDatabase", array("db"=>$db,"confirm"=>1))); ?>'"/> <input type="button" value="<?php hm("back"); ?>" onclick="window.location='<?php h(url("db", array("db"=>$db))); ?>'"/>