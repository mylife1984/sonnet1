<?php

namespace Application\HelloBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Application\HelloBundle\Entities\User;

class HelloController extends Controller
{
    public function indexAction($name)
    {
    	#$conn = $this->container->get('database_connection');
        #$recs = $conn->fetchAll('SELECT * FROM foo');
        #var_dump($recs);
        
		$user = new User();
        $user->setName('Jonathan H. Wage');

        $em = $this->container->get('doctrine.orm.entity_manager');
        $em->persist($user);
        $em->flush();
                
        return $this->render('HelloBundle:Hello:index', array('name' => $name));
    }
}
