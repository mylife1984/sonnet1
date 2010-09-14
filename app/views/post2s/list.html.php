<?php
echo $this->html->link('新建',"post2s/new");
?>
<br/>
<?php foreach($posts as $post): ?>
    <article>
        <h1><?=$post->title ?></h1>
        <p><?=$post->body ?></p>
    </article>
<?php endforeach; ?>

