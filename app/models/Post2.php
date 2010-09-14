<?php
 
namespace app\models;
 
class Post2 extends \lithium\data\Model {
	
	public static function __init(array $options = array()) {
        $self = static::_object(); 
        $self->_meta['connection'] = "mongo";
        
        parent::__init($options);
	}
}
?>