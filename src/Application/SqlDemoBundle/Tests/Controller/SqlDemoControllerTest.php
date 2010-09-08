<?php
namespace Application\SqlDemoBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class SqlDemoControllerTest extends WebTestCase
{
	/*
	 * phpunit -c app src/Application/SqlDemoBundle/Tests/Controller/SqlDemoControllerTest.php
	 */
	public function testIndex()
	{
		$client = $this->createClient();
		$resp = $client->request('GET', '/sql/Fabien');
		$this->assertTrue($resp->filter('html:contains("Sql Demo for Fabien")')->count() > 0);
	}
}