<?php

class FwPhpUnitTestCase extends PHPUnit_Framework_TestCase   {

    public function __construct() {
        parent::__construct();
       // $this->setUseErrorHandler(true);
      //  $this->setUseOutputBuffering(true);
    }
    
    private $browser;
    public function getBrowser() {
        if($this->browser && $this->browser->sessionId) {
            return $this->browser;
        }
        else {
        	include_once "Testing/Selenium.php";
            $browser = new Testing_Selenium("*firefox", BASE_URL);
            $browser->start();
            $this->browser = $browser;
            return $browser;
        }
    }
    
    public function assertEqual($first, $second, $message = '%s') {
    	$this->assertEquals($first, $second, $message);	
    }
    
    
    public function getResourcePath($name) {
        return APPROOT . "/testers/resources/$name";
    }

}

?>