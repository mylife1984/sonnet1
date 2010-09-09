<?php

namespace Application\SqlDemoBundle\Tests;

use Application\SqlDemoBundle\Entity\User;

use Application\HelloBundle\Tests\SonnetBaseTestCase;

class SqlDemoTestCase extends SonnetBaseTestCase
{
    public function prepareTables()
    {
    	$this->preparedUser();
    }
    
    /**
     * 准备测试数据：User
     */
	public function preparedUser()
    {
        $em = $this->getEm();
    	$conn = $em->getConnection();
		$conn->executeUpdate('DELETE FROM t_user');

		//user 1
    	$user = new User;
        $user->setName("user1");
        $em->persist($user);
        $em->flush();
    	
    }
	

}

