<?php

$loader->import('config.php');
$rootDir = dirname(dirname(__DIR__));

$container->loadFromExtension('web', 'config', array(
    'router'   => array('resource' => '%kernel.root_dir%/config/routing_dev.php'),
    'profiler' => array('only-exceptions' => false),
));

$container->loadFromExtension('webprofiler', 'config', array(
    'toolbar' => true,
    'intercept-redirects' => true,
));

$container->loadFromExtension('zend', 'logger', array(
    'priority' => 'info',
    'path'     => '%kernel.logs_dir%/%kernel.environment%.log',
));

// Doctrine Configuration
$container->loadFromExtension('doctrine', 'dbal', array(
	'driver'   => 'PDOSqlite',
    'path'   => $rootDir . '\db.sqlite',
    'user'     => '',
    'password' => '',
));
$container->loadFromExtension('doctrine', 'orm');
