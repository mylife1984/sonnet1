<script language="javascript">
//show operation buttons for one row
function showOperationButtons(id) {
	var row = $("#object_" + id);
	row.css("background-color", "#eeefff");
	row.css("border", "2px #ccc solid");
}

//hide operation buttons for one row
function hideOperationButtons(id) {
	var row = $("#object_" + id);
	row.css("background-color", "#fff");
	row.css("border", "0");
}

/** expand text area **/
function expandText(id) {
	var text = $("#text_" +id);
	if (text.attr("expand") == "true") {
		text.css("height", "");
		text.css("max-height", 150);
		text.attr("expand", "false");
		text.attr("title", "Double click to expand");
		$("#expand_" + id).html("Expand");
	}
	else {
		text.css("height", text[0].scrollHeight);
		text.css("max-height", text[0].scrollHeight);
		text.attr("expand", "true");
		text.attr("title", "Double click to collapse");
		$("#expand_" + id).html("Collapse");
	}
}

//change command - findAll, modify, remove
function changeCommand(select) {
	//newobj input box
	var value = select.value;
	if (value == "modify") {
		$("#newobjInput").show();
	}
	else {
		$("#newobjInput").hide();
	}
	
	//limit input box
	if (value == "findAll") {
		$("#limitLabel").show();
		$("#pageSetLabel").show();
		$("#fieldsAndHints").show();
	}
	else {
		$("#limitLabel").hide();
		$("#pageSetLabel").hide();
		$("#fieldsAndHints").hide();
	}
}

//switch html and text
function changeText(id) {
	var textDiv = $("#text_" + id);
	var fieldDiv = $("#field_" + id);
	if (textDiv.is(":visible")) {
		textDiv.hide();
		fieldDiv.show();
	}
	else {
		textDiv.show();
		fieldDiv.hide();
	}
}

/**
 * extract params from a form
 *
 * @param form Form element
 */
function formToParams (form) {
	var params = {};
	var elements = form.elements;
	for (var i = 0; i < elements.length; i ++) {
		var element = elements[i];
		var name = element.name;
		var tag = element.tagName;
		if (!name) {
			continue;
		}
		if (tag == "TEXTAREA") {
			params[name] = element.value;
		}
		else if (tag == "SELECT") {
			var options = element.options;
			for (var j = 0; j < options.length; j ++) {
				if (options[j].selected) {
					params[name] = options[j].value;
				}
			}
		}
		else if (element.type) {
			switch (element.type.toLowerCase()) {
				case "text": 
				case "hidden":
				case "password":
				case "button":
				case "submit":
				case "reset":
				case "image":
					params[name] = element.value;
					break;
				case "checkbox":
				case "radio":
					if (element.checked) {
						params[name] = element.value;
					}
					break;
			}
		}
	}
	return params;
};

//explain query
function explainQuery(form) {
	var params = formToParams(form);
	delete params["action"];
	jQuery.ajax({
		data: params,
		success: function (data, textStatus, request) {
			$("#records").html(data);
		},
		url:"<?php h(url("explainQuery"));?>",
		type:"POST"
	});
}

/** show more menus **/
function showMoreMenus(link) {
	var obj = $(link);
	setManualPosition(".menu", obj.position().left);
}

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
	$(".menu").hide();
}

function showQueryFields(link) {
	var fields = $("#query_fields_list");
	fields.show();
	fields.css("left", $(link).position().left);
	fields.css("top", $(link).position().top + $(link).height() + 3);
}

function closeQueryFields() {
	$("#query_fields_list").hide();
	$("#query_fields_count").html(countChecked("query_fields[]"));
}

function showQueryHints(link) {
	var fields = $("#query_hints_list");
	fields.show();
	fields.css("left", $(link).position().left);
	fields.css("top", $(link).position().top + $(link).height() + 3);
}

function closeQueryHints() {
	$("#query_hints_list").hide();
	$("#query_hints_count").html($(".query_hints:checked").length);
}

function countChecked(name) {
	var boxes = document.getElementsByName(name);
	var count = 0;
	for (var i = 0; i < boxes.length; i ++) {
		if (boxes[i].checked) {
			count ++;
		}
	}
	return count;
}

/** init the page **/
$(function () {
	$(document).click(function (e) { 
		hideMenus();
		if (e.target.tagName == "DIV" || e.target.tagName == "P") {
			closeQueryFields();
			closeQueryHints();
		}
	});
	$("font").dblclick(function () {
		return false;
	});
});

//highlight collection in leftbar
window.parent.frames["left"].highlightCollection("<?php h($collection); ?>");
</script>

<style type="text/css">
.fieldsmenu {
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
  width:400px;
}
.fieldsmenu ul {list-style-type:none; margin:0; padding:0}
.fieldsmenu ul li {float:left; width:200px}
</style>

<h3><?php render_navigation($db, $collection, false);?></h3>

<div class="operation">
	<strong><?php hm("query"); ?></strong>[<a href="<?php h($arrayLink);?>" <?php if(x("format")=="array"):?>style="text-decoration:underline"<?php endif;?>>Array</a>|<a href="<?php h($jsonLink); ?>" <?php if(x("format")!="array"):?>style="text-decoration:underline"<?php endif;?>>JSON</a></a>] | 
	<a href="<?php h($_SERVER["REQUEST_URI"]);?>"><?php hm("refresh"); ?></a> |
	<a href="<?php h(url("createRow", xn())); ?>"><?php hm("insert"); ?></a> | 
	<a href="<?php h(url("clearRows", xn())); ?>" onclick="return window.confirm('Are you sure to delete all records in collection \'<?php h($collection);?>\'?');"><?php hm("clear"); ?></a> |
	<a href="<?php h(url("collectionStats", xn())); ?>"><?php hm("statistics"); ?></a> |
	<a href="<?php h(url("collectionExport", xn())); ?>"><?php hm("export"); ?></a> |
	<a href="<?php h(url("collectionImport", xn())); ?>"><?php hm("import"); ?></a> |
	<a href="#" onclick="showMoreMenus(this);return false;"><?php hm("more");?> &raquo;</a>
	<div class="menu">
		<a href="<?php h(url("collectionProps", xn())); ?>"><?php hm("properties");?></a><br/>
		<a href="<?php h(url("collectionIndexes", xn())); ?>"><?php hm("indexes");?></a><br/>
		<a href="<?php h(url("collectionRename", xn())); ?>"><?php hm("rename");?></a><br/>
		<a href="<?php h(url("collectionDuplicate", xn())); ?>"><?php hm("duplicate"); ?></a><br/>
		<a href="<?php h(url("collectionTransfer", xn())); ?>"><?php hm("transfer");?></a><br/>
		<a href="<?php h(url("collectionValidate", array( "db" => $db,"collection"=>$collection ))); ?>"><?php hm("validate"); ?></a><br/>
		<a href="<?php h(url("removeCollection", xn())); ?>" onclick="return window.confirm('Are you sure to drop collection \'<?php h($collection);?>\'?');"><?php hm("drop"); ?></a> </div>
	</div>

<div class="query">
<form method="get">
<input type="hidden" name="db" value="<?php h($db);?>"/>
<input type="hidden" name="collection" value="<?php h($collection);?>"/>
<input type="hidden" name="action" value="<?php h(x("action"));?>"/>
<table>
	<tr>
		<td valign="top">
			<textarea name="criteria" rows="5" cols="70" style="height:100px"><?php h(x("criteria"));?></textarea><br/>
			<div id="newobjInput" <?php if (x("command") !="modify"):?>style="display:none"<?php endif;?>>
				New Object(see <a href="http://www.mongodb.org/display/DOCS/Updating" target="_blank">Updating</a> operators):<br/>
				<textarea name="newobj" rows="5" cols="70"><?php h(x("newobj"));?></textarea>
			</div>
		</td>
		<td valign="top" class="field_orders">
			<p><input type="text" name="field[]" value="<?php h(rock_array_get(x("field"),0));?>" /> <select name="order[]"><option value="asc" <?php if (rock_array_get(x("order"),0)=="asc"):?>selected="selected"<?php endif;?>>ASC</option><option value="desc" <?php if (rock_array_get(x("order"),0)=="desc"):?>selected="selected"<?php endif;?>>DESC</option></select></p>
			<p><input type="text" name="field[]" value="<?php h(rock_array_get(x("field"),1));?>" /> <select name="order[]"><option value="asc" <?php if (rock_array_get(x("order"),1)=="asc"):?>selected="selected"<?php endif;?>>ASC</option><option value="desc" <?php if (rock_array_get(x("order"),1)=="desc"):?>selected="selected"<?php endif;?>>DESC</option></select></p>
			<p><input type="text" name="field[]" value="<?php h(rock_array_get(x("field"),2));?>" /> <select name="order[]"><option value="asc" <?php if (rock_array_get(x("order"),2)=="asc"):?>selected="selected"<?php endif;?>>ASC</option><option value="desc" <?php if (rock_array_get(x("order"),2)=="desc"):?>selected="selected"<?php endif;?>>DESC</option></select></p>
			<p><input type="text" name="field[]" value="<?php h(rock_array_get(x("field"),3));?>" /> <select name="order[]"><option value="asc" <?php if (rock_array_get(x("order"),3)=="asc"):?>selected="selected"<?php endif;?>>ASC</option><option value="desc" <?php if (rock_array_get(x("order"),3)=="desc"):?>selected="selected"<?php endif;?>>DESC</option></select> </p>
		</td>
	</tr>
	<tr>
		<td colspan="2">
			<!-- query fields and hints -->
			<span id="fieldsAndHints" <?php if (x("command") !="findAll"):?>style="display:none"<?php endif;?>>
			<?php if(!empty($nativeFields)):?>
				<a href="#" onclick="showQueryFields(this);return false;" title="Choose fields to display">▼ Fields(<span id="query_fields_count"><?php h(count($queryFields)+1);?></span>)</a> |
				<a href="#" onclick="showQueryHints(this);return false;" title="Choose indexes will be used in query">▼ Hints(<span id="query_hints_count"><?php h(count($queryHints));?></span>)</a> |
			<?php endif; ?>
			</span>
			<!-- end query fields and hints -->
			
			<label id="limitLabel" <?php if (x("command") !="findAll"):?>style="display:none"<?php endif;?>><?php hm("limit"); ?>:<input type="text" name="limit" size="5" value="<?php h(xi("limit"));?>"/> |</label>
			<span id="pageSetLabel" <?php if (x("command") !="findAll"):?>style="display:none"<?php endif;?>>
			<select name="pagesize" title="<?php hm("rows_per_page"); ?>">
			<?php foreach (array(10, 15, 20, 30, 50) as $pagesize):?>
				<option value="<?php h($pagesize);?>" <?php if(x("pagesize")==$pagesize):?>selected="selected"<?php endif;?>>Rows:<?php h($pagesize);?></option>
			<?php endforeach;?>
			</select> |</span>
			<?php hm("action"); ?>:
			<select name="command" onchange="changeCommand(this)">
				<option value="findAll" <?php if(x("command")=="findAll"):?>selected="selected"<?php endif;?>>findAll</option>
				<option value="remove" <?php if(x("command")=="remove"):?>selected="selected"<?php endif;?>>remove</option>
				<option value="modify" <?php if(x("command")=="modify"):?>selected="selected"<?php endif;?>>modify</option>
			</select>
		</td>
	</tr>
	<tr>
		<td colspan="2"><input type="submit" value="<?php hm("submit_query"); ?>"/> <input type="button" value="<?php hm("explain"); ?>" onclick="explainQuery(this.form)" /> <input type="button" value="<?php hm("clear_conditions"); ?>" onclick="window.location='<?php h(url("collection", array( "db"=>$db, "collection" => $collection ))); ?>'"/>
			<?php if(isset($cost)):?>Cost <?php h(round($cost, 6));?>s<?php endif;?>
			<?php if(isset($message)):?><p class="error"><?php h($message);?></p><?php endif;?></td>
	</tr>
</table>

<!-- float divs (for fields and hints) -->
<div id="query_fields_list" class="fieldsmenu">
	<div align="right" style="padding-right:10px;background:#999"><a href="#" onclick="closeQueryFields();return false;" title="Click to close"><img src="images/accept.png" width="14"/></a></div>
	<ul>
	<?php foreach ($nativeFields as $field):?>
		<li><label>
			<input type="checkbox" name="query_fields[]" value="<?php h($field); ?>" 
				<?php if(in_array($field,$queryFields)||$field=="_id"): ?>checked="checked"<?php endif;?> 
				<?php if($field=="_id"): ?>disabled="disabled"<?php endif?>
			/> <?php h($field); ?></label></li>
	<?php endforeach; ?>
	</ul>
</div>
<div id="query_hints_list" class="fieldsmenu">
	<div align="right" style="padding-right:10px;background:#999"><a href="#" onclick="closeQueryHints();return false;" title="Click to close"><img src="images/accept.png" width="14"/></a></div>
	<ul>
	<?php foreach ($indexFields as $index => $field):?>
		<li title="<?php h(htmlspecialchars($field["keystring"])); ?>"><label><input type="checkbox" name="query_hints[<?php h($index); ?>]" value="<?php h($field["name"]); ?>" <?php if(in_array($field["name"],$queryHints)): ?>checked="checked"<?php endif;?> class="query_hints" /> <?php h($field["name"]); ?></label></li>
	<?php endforeach; ?>
	</ul>
</div>
<!-- end float divs -->

</form>
</div>

<div id="records">
	<?php if(!isset($page) || $page->total() == 0):?>
		<?php if (x("command") != "findAll"):?>
			<p><?php if (isset($count)): h($count);?> rows may be affected.<?php endif;?></p>
		<?php else:?>
			<p>No records is found.</p>
		<?php endif;?>
	<?php else: ?>
		<p class="page"><?php h($page); ?> (<?php h(min($page->total(), $page->offset()+$page->size()));?>/<?php h($page->total());?>)</p>
		
		<?php foreach ($rows as $index => $row):?>
		<div style="border:2px #ccc solid;margin-bottom:5px;" onmouseover="showOperationButtons('<?php h($index);?>')" onmouseout="hideOperationButtons('<?php h($index);?>')">
			<table width="100%" border="0" id="object_<?php h($index);?>">
				<tr>
					<td valign="top" width="50">#<?php echo $page->total() - $page->offset() - $index; ?></td>
					<td>
					<div class="operation" id="operate_<?php h($index);?>">
						<!-- you can modify row when _id is not empty -->
						<?php if(isset($row["_id"])):?>
							<a href="<?php echo url("modifyRow", array( 
								"db" => $db, 
								"collection" => $collection, 
								"id" => ($row["_id"] instanceof MongoId) ? $row["_id"]->__toString() : $row["_id"],
								"uri" => $_SERVER["REQUEST_URI"]
							)); ?>"><?php hm("update"); ?></a> |
						
							<a href="<?php echo url("deleteRow", array( 
								"db" => $db, 
								"collection" => $collection, 
								"id" => ($row["_id"] instanceof MongoId) ? $row["_id"]->__toString() : $row["_id"],
								"uri" => $_SERVER["REQUEST_URI"]
							)); 
							?>" onclick="return window.confirm('Are you sure to delete the row #<?php echo $page->offset() + $index; ?>?');"><?php hm("delete"); ?></a> |
							
							<a href="<?php h(url("createRow", array( 
								"db" => $db, 
								"collection" => $collection, 
								"id" => ($row["_id"] instanceof MongoId) ? $row["_id"]->__toString() : $row["_id"],
								"uri" => $_SERVER["REQUEST_URI"]
							))); ?>"><?php hm("duplicate"); ?></a> |
						<?php endif;?>
						<a href="#" onclick="changeText('<?php h($index);?>');return false;"><?php hm("text"); ?></a> |
						<a href="#" id="expand_<?php h($index);?>" onclick="expandText('<?php h($index);?>');">Expand</a>
						<?php if(MCollection::isFile($row)):?>
						| GridFS: <a href="<?php
						h(url("downloadFile", array(
							"db" => $db,
							"collection" => $collection,
							"id" => ($row["_id"] instanceof MongoId) ? $row["_id"]->__toString() : $row["_id"]
						)));
						?>">Download</a> <a href="<?php
						h(url("collection", array(
							"db" => $db,
							"collection" => MCollection::chunksCollection($collection),
							"criteria" => 'array(
	"files_id" => ' . (($row["_id"] instanceof MongoId) ? "new MongoId(\"" . addslashes($row["_id"]->__toString()) . "\")" : "\"" . addslashes($row["_id"]) . "\"") . '
)')));
						?>">Chunks</a>
						<?php endif;?>
					</div>	
					<div id="text_<?php h($index);?>" style="max-height:150px;overflow-y:hidden;width:90%" ondblclick="expandText('<?php h($index);?>');" title="Double click to expand"><?php h($row["data"]); ?></div>
					<div id="field_<?php h($index);?>" style="display:none;max-height:150px;overflow-y:auto"><textarea rows="7" cols="60" ondblclick="this.select()" title="Double click to select all"><?php h($row["text"]);?></textarea></div>
				</td>
				</tr>
			</table>
		</div>
		<?php endforeach; ?>
	
	
		<p class="page"><?php h($page); ?></p>
	<?php endif;?>
</div>
