<?php
namespace Application\HelloBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class HelloControllerTest extends WebTestCase
{
	/**
	 * @group testIndex
	 * phpunit -c app --group testIndex src/Application/HelloBundle/Tests/Controller/HelloControllerTest.php
	 */
	public function testIndex()
	{
		$client = $this->createClient();
		$resp = $client->request('GET', '/hello/Fabien');
		$this->assertTrue($resp->filter('html:contains("Hello Fabien")')->count() > 0);
	}
}