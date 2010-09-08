<?php

namespace Application\SqlDemoBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Application\HelloBundle\Entities\User;

class SqlDemoController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('SqlDemoBundle:sql:index', array('name' => $name));
    }
}
