<?php

$vendorDir = __DIR__.'/vendor';

require_once $vendorDir.'/symfony/src/Symfony/Framework/UniversalClassLoader.php';

use Symfony\Framework\UniversalClassLoader;

$loader = new UniversalClassLoader();
$loader->registerNamespaces(array(
    'Application'                => __DIR__,
    'Bundle'                     => __DIR__,
    'Symfony'                    => $vendorDir.'/Symfony/src',
    'Doctrine\Common'            => $vendorDir.'/Doctrine/lib/vendor/doctrine-common/lib',
    'Doctrine\DBAL'              => $vendorDir.'/doctrine-dbal/lib',
    'Doctrine'                   => $vendorDir.'/Doctrine/lib',
    //'Doctrine\ODM\MongoDB'       => $vendorDir.'/doctrine-mongodb/lib',
    'Zend'                       => $vendorDir.'/zend/library',
));
$loader->register();
