<?php

use Symfony\Component\Routing\RouteCollection;
use Symfony\Component\Routing\Route;

$collection = new RouteCollection();
$collection->addRoute('sqldemo', new Route('/sql/:name', array(
    '_controller' => 'SqlDemoBundle:SqlDemo:index',
)));

return $collection;
