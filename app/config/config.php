<?php
$rootDir = dirname(dirname(__DIR__));

$container->loadFromExtension('kernel', 'config', array(
    'charset'       => 'UTF-8',
    'error_handler' => null,
));

$container->loadFromExtension('web', 'config', array(
    'router'     => array('resource' => '%kernel.root_dir%/config/routing.php'),
    'validation' => array('enabled' => true, 'annotations' => true),
));

$container->loadFromExtension('web', 'templating', array(
    'escaping'       => "htmlspecialchars",
#    'assets_version' => "SomeVersionScheme",
));

// Doctrine Configuration
$container->loadFromExtension('doctrine', 'dbal', array(
	'driver'   => 'PDOSqlite',
    'dbname'   => $rootDir . '\db.sqlite',
    'user'     => '',
    'password' => '',
));
$container->loadFromExtension('doctrine', 'orm');

