<h3><?php render_navigation($db,$collection,false); ?> &raquo; Modify Row '<?php h($row["_id"]);?>' [<a href="<?php h($_SERVER['REQUEST_URI']);?>"><?php hm("refresh"); ?></a>]</h3>

<?php if (isset($message)): ?>
<p class="message">
<?php h($message);?>
</p>
<?php endif;?>
<?php if (isset($error)): ?>
<p class="error">
<?php h($error);?>
</p>
<?php endif;?>

<form method="post">
_id:<br/>
<input type="text" readonly value="<?php h($row["_id"]);?>" size="72"/>
<br/>
Data:<br/>
<textarea rows="35" cols="70" name="data"><?php h($data); ?></textarea><br/>
<input type="submit" value="<?php hm("save"); ?>"/> <input type="button" value="<?php hm("back"); ?>" onclick="window.location='<?php h(xn("uri"));?>'"/>
</form>

Data must be a valid PHP array, just like:
<blockquote>
<pre>
array (
	'value1' => 1,
	'value2' => 2,
	...
);
</pre>
</blockquote>