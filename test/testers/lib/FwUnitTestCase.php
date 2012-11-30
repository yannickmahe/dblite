<?php

class FwUnitTestCase extends UnitTestCase    {

    public function __construct() {
        parent::__construct();
    }

    private $browser;
    public function getBrowser() {
        if($this->browser && $this->browser->sessionId) {
            return $this->browser;
        }
        else {
        	include_once "Testing/Selenium.php";
            $browser = new Testing_Selenium("*safari", MAIN_URL);
            $browser->start();
            $this->browser = $browser;
            return $browser;
        }
    }

    public function assertEquals($first, $second, $message = '%s') {
    	$this->assertEqual($first, $second, $message);
    }

    public function assertsTrue($result, $message = false) {
    	$this->assertTrue($result, $message = false);
    }    
}

?>