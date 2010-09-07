<?php

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

// Sessions
/*
$container->loadFromExtension('kernel', 'session', array(
    'default_locale' => "fr",
    'session' => array(
        'name' => "SYMFONY",
        'type' => "Native",
        'lifetime' => "3600",
    )
));
*/

// Twig Configuration
/*
$container->loadFromExtension('twig', 'config', array('auto_reload' => true));
*/

// Doctrine Configuration
$container->loadFromExtension('doctrine', 'dbal', array(
	'driver'   => 'PDOMySql',
    'dbname'   => 'Symfony2',
    'user'     => 'root',
    'password' => '',
));
$container->loadFromExtension('doctrine', 'orm');

/*
<doctrine:dbal 
    driver="PDOSqlite" 
    dbname="%kernel.data_dir%/test.sqlite" 
    user="" 
    password="" 
/> 
*/

// Swiftmailer Configuration
/*
$container->loadFromExtension('swift', 'mailer', array(
    'transport'  => "smtp",
    'encryption' => "ssl",
    'auth_mode'  => "login",
    'host'       => "smtp.gmail.com",
    'username'   => "xxxxxxxx",
    'password'   => "xxxxxxxx",
));
*/
