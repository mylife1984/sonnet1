<?php if(!$success): ?>
    <p>Error In Saving Post!</p>
<?php endif; ?>
    
<?=$this->form->create(); ?>
        <?=$this->form->field('title');?>
        <?=$this->form->field('body', array('type' => 'textarea'));?>
        <?=$this->form->submit('Add Post (Mongo)'); ?>
<?=$this->form->end(); ?>