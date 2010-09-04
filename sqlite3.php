<?php

#extension=php_pdo_sqlite.dll

try 
{
  $filepath = "sqlite:d:/dev-php/sonnet1/db.sqlite";
  $db = new PDO($filepath); 
}
catch(Exception $e) 
{
  die($error);
}

foreach($db->query('SELECT * FROM foo') as $row) 
{ 
	foreach($row as $key=>$val)
	{ 
		print "$key: $val\n";
	}	 
} 
  
unset($db);
  
#EOP
