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
        #$em = $this->container->getDoctrine_Orm_DefaultEntityManagerService();
    	
    	#$user = new User();
        #$user->setName($name);
        #$em->persist($user);
        #$em->flush();
        
        return $this->render('SqlDemoBundle:sql:add', array('name' => $name));
    }
}
