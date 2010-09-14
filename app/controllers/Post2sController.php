<?php
namespace app\controllers;

use app\models\Post2;
 
class Post2sController extends \lithium\action\Controller {
	
	/**
	 * 显示列表
	 */
    public function show_list() {
		$posts = Post2::all();    	

        $data = compact('posts');
        $layout = 'default';
        $template = 'list';
		$this->render(compact('layout','data','template'));
    }
    
    /**
     * 新建 
     */
	public function add() {
   		$success = false;

        if ($this->request->data) {
            $post = Post2::create($this->request->data);
            $success = $post->save();
        }
        
        $data = compact('success');
        $layout = 'default';
        $template = 'add';
		$this->render(compact('layout','data','template'));        
	}    
    
}
?>