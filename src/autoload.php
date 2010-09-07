<?php

require_once dirname(dirname(__DIR__)).'/symfony2/symfony/src/Symfony/Framework/UniversalClassLoader.php';

use Symfony\Framework\UniversalClassLoader;

$loader = new UniversalClassLoader();
$loader->registerNamespaces(array(
    'Symfony'                    => dirname(dirname(__DIR__)).'/symfony2/symfony/src',
    'Application'                => __DIR__,
    'Bundle'                     => __DIR__,
    'Doctrine\\Common'           => dirname(dirname(__DIR__)).'/doctrine/common/lib',
    'Doctrine\\ODM\\MongoDB'     => dirname(dirname(__DIR__)).'/doctrine/mongodb-odm/lib',
    'Doctrine\\DBAL'             => dirname(dirname(__DIR__)).'/doctrine/dbal/lib',
    'Doctrine'                   => dirname(dirname(__DIR__)).'/doctrine/doctrine2/lib',
    'Zend'                       => dirname(dirname(__DIR__)).'/zend/library',
));
$loader->registerPrefixes(array(
    'Swift_' => dirname(dirname(__DIR__)).'/swiftmailer/lib/classes'
    //'Twig_'  => dirname(dirname(__DIR__)).'/Twig/lib',
));
$loader->register();
