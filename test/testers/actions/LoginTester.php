<?php
/*
 * Login Test class various scenario
 */
class LoginTester extends FwUnitTestCase{

	/*
	 * Creating the object of class CommonTestCase
	 */
	public function LoginTester() {
		$this->case = new CommonTestCase();
	}

	/*
	 * Success
	 * Provided with all the required fields filled properly.
	 */
	public function testLoginSuccess(){
		$this->case->browser();
		$this->case->ClickLink("login");
		$this->case->Login("test", "test");
	}

	/*
	 * Failure test
	 * Provided with all required fields left blank.
	 */
	public function testLoginFailWithAllBlank(){
		$this->case->Logout();
		$this->case->ClickLink("dblite_login");
		$this->case->Login("", "");
		$this->case->browser->setSpeed(1000);
		$this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
		$this->assertEquals('Form fields could not be submitted with empty values', $msg);
		$this->case->clickOkButton();
	}

	/*
	 * Failure Test
	 * Provided with Username field left blank.
	 */
	public function testLoginFailWithUsernameBlank(){
		$this->case->Login("", "test");
		$this->case->browser->setSpeed(1000);
		$this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
		$this->assertEquals('Form fields could not be submitted with empty values', $msg);
		$this->case->clickOkButton();
	}

	/*
	 * Failure Test
	 * Provided with password field left blank.
	 */
	public function testLoginFailWithPassWordBlank(){
		$this->case->Login("test", "");
		$this->case->browser->setSpeed(1000);
		$this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
		$this->assertEquals('Form fields could not be submitted with empty values', $msg);
		$this->case->clickOkButton();
	}
  /*
   * Failure test
   * Provided with incorrect username and password.
   */
	public function testLoginFailWithIncorrectFields(){
		$this->case->Login("test1!@", "test1#@");
		$this->case->browser->setSpeed(1000);
		$this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
		$this->assertEquals('Incorrect username and/or password', $msg);
		$this->case->clickOkButton();
	}

	/*
	 * Failure Test
	 * Provided with Incorrect user name
	 */
	public function testLoginFailWithIncorrectUsername(){
		$this->case->Login("test1@!", "test");
		$this->case->browser->setSpeed(1000);
		$this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
		$this->assertEquals('Incorrect username and/or password', $msg);
		$this->case->clickOkButton();
	}

	/*
	 * Failure test
	 * Provided with incorrect password for a correct user name
	 */
	public function testLoginFailWithIncorrectPassword(){
		$this->case->Login("test", "test1@");
		$this->case->browser->setSpeed(1000);
		$this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
		$this->assertEquals('Incorrect username and/or password', $msg);
		$this->case->clickOkButton();
	}
}
?>