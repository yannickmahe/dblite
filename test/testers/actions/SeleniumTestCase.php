<?php

include_once "Testing/Selenium.php";

class SeleniumTestCase extends PHPUnit_Framework_TestCase  {

    private $browser;
    public function getBrowser() {
        if($this->browser && $this->browser->sessionId) {
            return $this->browser;
        }
        else {
            $browser = new Testing_Selenium("*firefox", BASE_URL);
            $browser->start();
            $this->browser = $browser;
            return $browser;
        }
    }

    public function assertPattern($pattern, $value) {
        return $this->assertRegExp($pattern, $value);
    }
}

?>
