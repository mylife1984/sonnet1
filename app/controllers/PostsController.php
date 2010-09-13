<?php
namespace app\controllers;

use app\models\Post;
 
class PostsController extends \lithium\action\Controller {
	
    public function show_post_list() {
    	
    	#获取指定页的全部记录
        $page = 1;
        $limit = 2;
        $order = 'created desc';
 
        if (isset($this->request->query['page'])) {
            $page = $this->request->query['page'];
 
            if (!empty($this->request->query['limit'])) {
                $limit = $this->request->query['limit'];
            }
        }
 
        $offset = ($page - 1) * $limit;
        $total = Post::find('count');
        $total_page = floor(($total-1) / $limit)+1;
 
        $posts = Post::find('all', compact('conditions', 'limit', 'offset', 'order'))->to('array');
 
        #呈现	
        $title = 'Home';
        $data = compact('posts', 'limit', 'page', 'total','total_page','title');
        $layout = 'default';
        $template = 'list';
        
		$this->render(compact('layout','data','template'));        
    }
}
?>