<?php
namespace app\controllers;

use app\models\Post;
 
class PostsController extends \lithium\action\Controller {
    public function index() {
        $page = 1;
        $limit = 5;
        $order = 'created desc';
 
        if (isset($this->request->params['page'])) {
            $page = $this->request->params['page'];
 
            if (!empty($this->request->params['limit'])) {
                $limit = $this->request->params['limit'];
            }
        }
 
        $offset = ($page - 1) * $limit;
        $total = Post::find('count');
 
        $posts = Post::find('all', compact('conditions', 'limit', 'offset', 'order'))->to('array');
 
        $title = 'Home';
 
        return compact('posts', 'limit', 'page', 'total', 'title');
    }
}
?>