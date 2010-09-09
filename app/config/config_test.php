<?php

$loader->import('config_dev.php');
$rootDir = dirname(dirname(__DIR__));

$container->loadFromExtension('kernel', 'config', array(
    'error_handler' => false,
));

$container->loadFromExtension('webprofiler', 'config', array(
    'toolbar' => false,
    'intercept-redirects' => false,
));

$container->loadFromExtension('zend', 'logger', array(
    'priority' => 'debug',
));

$container->loadFromExtension('kernel', 'test');

// Doctrine Configuration
$container->loadFromExtension('doctrine', 'dbal', array(
	'driver'   => 'PDOSqlite',
    'path'   => $rootDir . '\db_test.sqlite',
    'user'     => '',
    'password' => '',
));
$container->loadFromExtension('doctrine', 'orm');
