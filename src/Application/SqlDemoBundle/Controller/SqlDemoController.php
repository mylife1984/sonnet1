<?php

namespace Application\SqlDemoBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Application\SqlDemoBundle\Entity\User;

class SqlDemoController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('SqlDemoBundle:sql:index', array('name' => $name));
    }
    
    public function addAction($name)
    {
    	$user = new User();
        $user->setName($name);

        $em = $this->container->get('doctrine.orm.entity_manager');
        $em->persist($user);
        $em->flush();
        
        return $this->render('SqlDemoBundle:sql:add', array('name' => $name));
    }
}
