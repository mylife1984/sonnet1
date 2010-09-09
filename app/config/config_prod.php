<?php

$loader->import('config.php');

$container->loadFromExtension('doctrine', 'dbal', array(
	'driver'   => 'PDOMySql',
    'dbname'   => 'sonnet1',
    'user'     => 'root',
    'password' => '123456',
));
$container->loadFromExtension('doctrine', 'orm');
