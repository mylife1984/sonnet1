<?php
/**
 * Lithium: the most rad php framework
 *
 * @copyright     Copyright 2010, Union of RAD (http://union-of-rad.org)
 * @license       http://opensource.org/licenses/bsd-license.php The BSD License
 */

use lithium\net\http\Router;
use lithium\core\Environment;

#-- home
Router::connect('/', array('Pages::view', 'args' => array('home')));

#-- hello
Router::connect('/hello', array('HelloWorld::index'));

#-- post crud
Router::connect('/posts', array('Posts::show_list'));
Router::connect('/posts/new', array('Posts::add'));
Router::connect('/posts/edit/{:args}', array('Posts::edit'));
Router::connect('/posts/delete/{:args}', array('Posts::delete'));
Router::connect('/posts/{:args}', array('Posts::view'));

?>