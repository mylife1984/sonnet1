<?php
namespace app\controllers;

use app\models\Post;
 
class PostsController extends \lithium\action\Controller {
	
	/**
	 * 显示列表
	 */
    public function show_list() {
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
    
    /**
     * 查看指定记录
     */
    public function view($id) {
        $post = Post::find($id);

        if (!$post) {
            throw new \Exception ('Invalid post if provided');
        }

        $post = $post->to('array');

        $title = $post['title'];
        $data = compact('post', 'id','title');
        $layout = 'default';
        $template = 'view';
		$this->render(compact('layout','data','template'));
    }
    
    /**
     * 新建 
     */
	public function add() {
        if ($this->request->data) {
            $post = Post::create($this->request->data);
            if ($post->save()) {
                $this->redirect(array('Posts::show_list'));
            }
        }
 
        if (empty($post)) {
            // Create an empty post object for use in form helper in view
            $post = Post::create();
        }
 
        $title = 'Add post';
        $data = compact('post','title');
        $layout = 'default';
        $template = 'add';
		$this->render(compact('layout','data','template'));        
	}    
	
	/**
	 * 修改
	 */
    public function edit($id) {
        $id = (int)$id;
        $post = Post::find($id);

        if (empty($post)) {
            $this->redirect(array('Posts::show_list'));
        }

        if ($this->request->data) {
            if ($post->save($this->request->data)) {
            	$this->redirect(array('Posts::show_list'));
            }
        }

        $title = 'Edit post';
 	    $data = compact('post','title');
        $layout = 'default';
        $template = 'edit';
		$this->render(compact('layout','data','template'));        
    }
	
    /**
     * 删除
     */
    public function delete($id = null) {
        $id = (int)$id;

        $post = Post::find($id);

        if (empty($post)) {
            $this->redirect(array('Posts::show_list'));
        }

        $post->delete();
        $this->redirect(array('Posts::show_list'));
        return;
    }
    
}
?>