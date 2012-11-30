<?php
/*
 * Register Test class various scenario
 */
class RegisterTester extends FwUnitTestCase{

	private $username = "";
	private $pass = "";
	private $repass = "";
	private $email = "";
	/*
	 * Creating the object of class CommonTestCase
	 */
	public function RegisterTester() {
		$this->case = new CommonTestCase();
		$this->username = "test";
		$this->pass = "test";
		$this->repass = "test";
		$this->email = "tester@manusis.com";
	}


	/*
	 * Sucess condition
	 * Provided all the fields filled with correct data.
	 */

	/* TODO::
	 *
	public function testRegisterSuccess($k=null){
//		$this->case->browser->setSpeed(2000);
		Logger::info("======k======= ", $k);
//		if($k == 1) {
//			return true;
//		}
		$res = 0;
		static $i =  1;
		if($i == 1) {
			$this->case->browser();
		}
		$this->case->Register($this->username.$i, $this->pass.$i, $this->repass.$i, 'tester'.$i.'@manusis.com');
		$res = $this->case->browser->isTextPresent("Error");
		Logger::info("===test res===", $res);
		if($res) {
			$this->assertTrue($this->case->browser->isTextPresent("Error"));
			$this->case->browser->setSpeed(2000);
			$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
			Logger::info("=====msg===== ", $msg);
			$this->assertEquals('/Username already exists/', $msg);
			$i++;
			$this->case->browser->setSpeed(2000);
		//		$this->case->Register($username.$i++, $pass.$i++, $repass.$i++, 'tester'.$i++.'@manusis.com');
				return($this->testRegisterSuccess($res));
		}
		else{
			return true;
		}
	}
	*/

	/*
	 * Failure condition
	 * Provided all the required fields left blank.
	 */
	public function testRegisterFailWithAllBlank(){
	//	$this->case->Logout();
		$this->case->browser();
		$this->case->ClickLink("dblite_register");
		$this->case->Register("", "", "", "");
		$this->case->browser->setSpeed(1000);
		$this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
		$this->assertEquals('Form fields could not be submitted with empty values', $msg);
		$this->case->clickOkButton();
	}

	/*
	 * Failure condition
	 * Provided the required username left blank.
	 */
	public function testRegisterFailWithUsernameBlank(){
		$this->case->Register("", "test", "test", "tester@manusis.com");
		$this->case->browser->setSpeed(1000);
		$this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
		$this->assertEquals('Form fields could not be submitted with empty values', $msg);
		$this->case->clickOkButton();
	}

	/*
	 * Failure condition
	 * Provided the required password field blank.
	 */
	public function testRegisterFailWithPasswordBlank(){
		$this->case->Register("test", "", "test", "tester@manusis.com");
		$this->case->browser->setSpeed(1000);
		$this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
		$this->assertEquals('Form fields could not be submitted with empty values', $msg);
		$this->case->clickOkButton();
	}

	/*
	 * Failure condition
	 * Provided the required Retype password field left blank.
	 */
  public function testRegisterFailWithRePassWordBlank(){
    $this->case->Register("test", "test", "", "tester@manusis.com");
    $this->case->browser->setSpeed(1000);
    $this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
		$this->assertEquals('Form fields could not be submitted with empty values', $msg);
		$this->case->clickOkButton();
  }

  /*
   * Failure condition
   * Provided the required Email field blank.
   */
  public function testRegisterFailWithEmailBlank(){
    $this->case->Register("test", "test", "test", "");
    $this->case->browser->setSpeed(1000);
    $this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
		$this->assertEquals('Form fields could not be submitted with empty values', $msg);
		$this->case->clickOkButton();
  }

  /*
   * Failure condition
   * Provided with invalid user name
   */
  public function testRegisterFailWithInvalidUsername(){
    $this->case->Register("test@1", "test", "test", "tester@manusis.com");
    $this->case->browser->setSpeed(1000);
    $this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
    $this->assertEquals('Username is not valid', $msg);
    $this->case->clickOkButton();
  }

  /*
   * Failure
   * Provided with invalid email.
   */
  public function testRegisterFailWithInvalidEmail(){
    $this->case->Register("test", "test", "test", "tester");
    $this->case->browser->setSpeed(1000);
    $this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
    $this->assertEquals('Email is not valid', $msg);
    $this->case->clickOkButton();
  }

  /*
   * Failure
   * Provided with password mismatch
   */
  public function testRegisterFailWithPasswordMismatch(){
    $this->case->Register("test", "test", "test12", "tester@manusis.com");
    $this->case->browser->setSpeed(1000);
    $this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
    $this->assertEquals('Passwords do not match', $msg);
    $this->case->clickOkButton();
  }
}
?>