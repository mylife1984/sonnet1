<?php 


class a1 {
	protected $b1 = "1";
	
    function __construct() {
        echo 'hi!';
    }
}

class a2 extends a1 {

	protected $b2 = "1";
	
    public static function say() {
        echo $b2;
    }
}

echo a2::say();

?>