<?php

$connection = new Mongo();
$db = $connection->test;
$collection = $db->foo;
$obj = $collection->findOne();
var_dump( $obj );

?>