<?php
namespace Application\SqlDemoBundle\Tests\Controller;

use Application\SqlDemoBundle\Tests\SqlDemoTestCase;

class SqlDemoControllerTest extends SqlDemoTestCase
{
	protected function setUp()
	{
		$this->prepareTables();
	}

	/**
	 * @group testIndex
	 * phpunit -c app --group testIndex src/Application/SqlDemoBundle/Tests/Controller/SqlDemoControllerTest.php
	 */
	public function testIndex()
	{
		$client = $this->createClient();
		$crawler = $client->request('GET', '/sql/Fabien');
		$this->assertTrue($crawler->filter('html:contains("Sql Demo for Fabien")')->count() > 0);
	}

	/**
	 * @group testAdd
	 * phpunit -c app --group testAdd src/Application/SqlDemoBundle/Tests/Controller/SqlDemoControllerTest.php
	 */
	public function testAdd()
	{
		#$crawler = $this->client->request('GET', '/sql/add/Fabien');
		#$this->assertTrue($this->client->getResponse()->isSuccessful());

		#$user = $this->em->createQuery('select u from SqlDemoBundle:User where id = ?', 36);
		#echo var_dump($user);
        #$user->setName('new body');
        #$em->flush();
        		
		#$q = $this->em->createQuery('select u from Application\SqlDemoBundle\Entity\User u');
		#echo var_dump($q->getFirstResult());
		#$this->assertTrue($user[0]->getType() instanceof User);

		#$this->assertEquals(1, count($result));
		#$this->assertEquals($result[0]->getName(),"Fabien");

	}

}