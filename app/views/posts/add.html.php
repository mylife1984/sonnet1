<h2>新建</h2>
<?php
$this->form->config(array('templates' => array('error' => '<div class="error"{:options}>{:content}</div>')));
?>
<?=$this->form->create($post); ?>
    <?=$this->form->field('title',array('label'=>'标题'));?>
    <?=$this->form->field('body',array('label'=>'内容','type' => 'textarea', 'rows' => 10));?>
    <?=$this->form->submit('保存'); ?>
<?=$this->form->end(); ?>