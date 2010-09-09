<?php
namespace Application\SqlDemoBundle\Tests\Controller;

use Application\SqlDemoBundle\Entity\User;

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
		$em = $this->getEm();
    	$conn = $em->getConnection();
		
		$crawler = $this->client->request('GET', '/sql/add/Fabien');
		$this->assertTrue($this->client->getResponse()->isSuccessful());
		
    	#$user = new User();
        #$user->setName("user2");
        #$em->persist($user);
        #$em->flush();
    	
		$stmt = $conn->executeQuery('SELECT * FROM t_user');
		$this->assertEquals(1, $stmt->rowCount());
	}

}