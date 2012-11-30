<?php
/*
 * Manage Connection Test class various scenario
 */
class ManageConnectionTester extends FwUnitTestCase{

	/*
	 * Creating the object of class CommonTestCase
	 */
	public function ManageConnectionTester() {
		$this->case = new CommonTestCase();
	}


	public function ClickAddConnection(){

		$this->case->browser->click("//*[text()='Add Connection']");
		$this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
		if($msg == 'Connection added successfully') {
			$this->assertEquals('Connection added successfully', $msg);
		} else {
			$this->assertEquals('Connection name is already in use!', $msg);
		}
		$this->case->clickOkButton();
	}

	/*
	 * Failure test
	 * Provided with all required fields left blank.
	 */
	public function testAddNewConnectionFailWithAllBlank(){
		$this->case->browser();
		$this->case->ClickLink("dblite_login");
		$this->case->Login("test", "test");
		$this->case->browser->setSpeed(2000);
		$this->case->ClickLink("manage_connections");
		$this->case->AddConnection("", "", "", "", "", "", "");
		$this->case->browser->setSpeed(1000);
		$this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
		$this->assertEquals("Form fields could not be submitted with empty values", $msg);
		$this->case->clickOkButton();
	}

	/*
	 * Failure Test
	 * Provided the required type left blank.
	 */
	public function testAddNewConnectionFailWithTypeBlank(){
		$this->case->AddConnection("localhost", "", "localhost", "3306", "root", "", "");
		$this->case->browser->setSpeed(1000);
		$this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
		$this->assertEquals("Form fields could not be submitted with empty values", $msg);
		$this->case->clickOkButton();
	}
	/*
	 * Failure Test
	 * Provided the required HOST left blank.
	 */

	public function testAddNewConnectionFailWithHostBlank(){
		$this->case->AddConnection("localhost", "mysql", "", "3306", "root", "", "");
		$this->case->browser->setSpeed(1000);
		$this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
		$this->assertEquals("Form fields could not be submitted with empty values", $msg);
		$this->case->clickOkButton();
	}
	/*
	 * Failure Test
	 * Provided the required Port left blank.
	 */

	public function testAddNewConnectionFailWithPortBlank(){
		$this->case->AddConnection("localhost", "mysql", "localhost", "", "root", "", "");
		$this->case->browser->setSpeed(1000);
		$this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
		$this->assertEquals("Form fields could not be submitted with empty values", $msg);
		$this->case->clickOkButton();
	}
	/*
	 * Failure Test
	 * Provided the USERNAME left blank.
	 */

	public function testAddNewConnectionFailWithUsernameBlank(){
		$this->case->AddConnection("localhost", "mysql", "localhost", "3306", "", "", "");
		$this->case->browser->setSpeed(1000);
		$this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
		$this->assertEquals("Form fields could not be submitted with empty values", $msg);
		$this->case->clickOkButton();
	}

	/*
	 * Success
	 * Provided with all the required fields filled properly.
	 */
	public function testAddNewConnectionSuccess(){
//		$this->case->browser();
//		$this->case->ClickLink("dblite_login");
//		$this->case->Login("sandeep", "qwe");
//		$this->case->browser->setSpeed(2000);
//		$this->case->ClickLink("manage_connections");
		$this->case->AddConnection("localhost2", "mysql", "localhost", "3306", "root", "", "");
		$this->case->browser->setSpeed(1000);
		$this->assertTrue($this->case->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->case->browser->getText("//span[@class='ext-mb-text']");
		if($msg == 'Connection successful') {
			$this->assertEquals('Connection successful', $msg);
			$this->case->clickOkButton();
			$this->ClickAddConnection();
		} else {
			$this->assertEquals('Connection name is already in use!', $msg);
			$this->case->clickOkButton();
		}
	}

	/*
	 *
	 */
	public function testClickSavedConnection() {
//		$this->case->browser->runScript("Ext.Msg.alert('Info','ExtJs is working with your Selenium');");
		$this->case->browser->runScript("Ext.getCmp('server-connection-grid').getSelectionModel().selectFirstRow(1);");
		Logger::info("result=== ", $res);
	}
}
?>