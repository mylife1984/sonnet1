<?php foreach($posts as $post): ?>
 
<article>
    <h1><?= $this->html->link($post['title'], 'posts/view/'.$post['id']); ?></h1>
    <p><?=$this->html->link('Edit', array('controller' => 'posts', 'action' => 'edit', 'args' => array($post['id']))); ?></p>
    <p><?=$post['body'] ?></p>
</article>
<?php endforeach; ?>

<!-- Pagination section -->
<div id="pagination">
    <p class="next floated"><?php
        if ($total_page > 1 && $page < $total_page) {
            //echo '<li>Next Entries &rarr;';
            echo $this->html->link('Next Page &rarr;', array(
                'controller' => 'posts', 'action' => 'index',
                'page' => $page + 1, 'limit' => $limit
            ), array('escape' => false));
        } ?>
    </p>
    <p class="prev"><?php
        if ($total_page > 1 && $page > 1) {
            //echo '&larr; Previous Entries</li>';
        	echo $this->html->link('&larr;Previous Page', array(
                'controller' => 'posts', 'action' => 'index',
                 'page' => $page - 1, 'limit' => $limit
            ), array('escape' => false));
        }?>
    </p>
</div>