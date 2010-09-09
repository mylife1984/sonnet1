<?php
namespace Application\SqlDemoBundle\Tests\Controller;

use Application\SqlDemoBundle\Entity\User;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class SqlDemoControllerTest extends WebTestCase
{
	protected $client;
	protected $em;
	
    protected function setUp()
    {
		$this->client = $this->createClient();
		$container = $this->client->getContainer();
		$this->em = $container->get('doctrine.orm.entity_manager');
		
        $conn = $this->em->getConnection();
        $conn->executeUpdate('DELETE FROM t_user');
    }
	
    protected function tearDown()
    {
    	
    }
    
	/**
	 * @group testIndex
	 * phpunit -c app --group testIndex src/Application/SqlDemoBundle/Tests/Controller/SqlDemoControllerTest.php
	 */
	public function testIndex()
	{
		$crawler = $this->client->request('GET', '/sql/Fabien');
		$this->assertTrue($crawler->filter('html:contains("Sql Demo for Fabien")')->count() > 0);
	}

	/**
	 * @group testAdd
	 * phpunit -c app --group testAdd src/Application/SqlDemoBundle/Tests/Controller/SqlDemoControllerTest.php
	 */
	public function testAdd()
	{
		$crawler = $this->client->request('GET', '/sql/add/Fabien');
		$this->assertTrue($this->client->getResponse()->isSuccessful());
		
		$q = $this->em->createQuery('select u from SqlDemoBundle:User');
		echo var_dump($q->getFirstResult());
        #$this->assertTrue($user[0]->getType() instanceof User);
		        
        #$this->assertEquals(1, count($result));
		#$this->assertEquals($result[0]->getName(),"Fabien");
		
	}
	
}