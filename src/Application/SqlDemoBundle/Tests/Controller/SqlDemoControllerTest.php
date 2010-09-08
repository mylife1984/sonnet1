<?php
namespace Application\SqlDemoBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class SqlDemoControllerTest extends WebTestCase
{
	/**
	 * @group testIndex
	 * phpunit -c app --group testIndex src/Application/SqlDemoBundle/Tests/Controller/SqlDemoControllerTest.php
	 */
	public function testIndex()
	{
		$client = $this->createClient();
		$resp = $client->request('GET', '/sql/Fabien');
		$this->assertTrue($resp->filter('html:contains("Sql Demo for Fabien")')->count() > 0);
	}

	/**
	 * @group testIndex2
	 * phpunit -c app --group testIndex2 src/Application/SqlDemoBundle/Tests/Controller/SqlDemoControllerTest.php
	 */
	public function testIndex2()
	{
		$client = $this->createClient();
		$resp = $client->request('GET', '/sql/Fabien');
		$this->assertTrue($resp->filter('html:contains("Sql Demo for Fabien")')->count() == 0);
	}
	
}