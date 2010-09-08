<?php

use Symfony\Component\Routing\RouteCollection;
use Symfony\Component\Routing\Route;

$collection = new RouteCollection();
$collection->addRoute('sql_demo', new Route('/sql/:name', array(
    '_controller' => 'SqlDemoBundle:SqlDemo:index',
)));
$collection->addRoute('sql_demo_add', new Route('/sql/add/:name', array(
    '_controller' => 'SqlDemoBundle:SqlDemo:add',
)));

return $collection;
