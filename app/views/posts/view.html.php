<article>
    <h1><?= $post['title']; ?></h1>
    <p>
        <?=$this->html->link('Delete', '/posts/delete/'.$post['id']); ?>
    </p>
    <p><?php echo nl2br($post['body']); ?></p>
</article>