<?php foreach($posts as $post): ?>
 
<article>
    <h1><?= $this->html->link($post['title'], 'posts/'.$post['id']); ?></h1>
    <p><?=$this->html->link('修改', 'posts/edit/'.$post['id']); ?></p>
    <p><?=$post['body'] ?></p>
</article>
<?php endforeach; ?>

<!-- 翻页 -->
<div id="pagination">	
    <p class="next floated"><?php
        if ($total_page > 1 && $page < $total_page) {
            $next_page = $page + 1;
            echo $this->html->link('下一页 &rarr;',"posts?page=$next_page&limit=$limit",array('escape' => false));
        } ?>
    </p>
    <p class="prev"><?php
        if ($total_page > 1 && $page > 1) {
            $prev_page = $page - 1;
        	echo $this->html->link('&larr;上一页',"posts?page=$prev_page&limit=$limit",array('escape' => false));
        }?>
    </p>
</div>

<br/>
<?php
echo $this->html->link('新建',"posts/new");
?>