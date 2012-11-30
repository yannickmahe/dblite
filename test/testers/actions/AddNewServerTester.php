<?php
/*
 * Add new Server Test class for various scenario
 */
class AddNewServerTester extends FwUnitTestCase  {

	/*
	 * Function to delete the already created connection
	 */
	public function deleteServer(){
		$browser = $this->getBrowser();
		$browser->click("//div[@class='x-grid3-cell-inner x-grid3-col-0']");
		$browser->click("ext-gen319");
		$browser->click("ext-gen459");
	}

	/*
	 * Adding new server
	 */
	public function addNewServer(){
		$browser = $this->getBrowser();
    $browser->open("http://dblite.local/");
    $browser->click("ext-gen47");
    $browser->type("ext-comp-1029","Localhost");
    $browser->click("ext-gen151");
    $browser->click("//div[@id='ext-gen184']/div[1]");
    $browser->type("ext-comp-1030", "localhost");
    $browser->type("ext-comp-1031", "3306");
    $browser->type("ext-comp-1032", "root");
    $browser->type("ext-comp-1033", "");
    $browser->type("ext-comp-1034", "");
    $browser->clickAndWait("//button[@class='x-btn-text']");
		
	}
	/*
	 * Success Test
	 * Tests with all the field provided
	 */
	public function testaddNewServerSuccess(){
		$browser = $this->getBrowser();
		$this->deleteServer();
		$this->addNewServer();
		$this->assertTrue($browser->isAlertPresent());
    $this->assertEquals('/Connection successful/', $browser->getAlert());
	}

	/*
	 * Failure Test
	 * Provided all the required fields left blank
	 * Like connection name,host name,port,username
	 */
	public function testaddNewServerFailWithAllBlank(){
		$browser = $this->getBrowser();
		$browser->open("http://dblite.local/");
		$browser->click("ext-gen47");
		$browser->type("ext-comp-1029","");
		$browser->click("ext-gen151");
		$browser->type("ext-comp-1030", "");
		$browser->type("ext-comp-1031", "");
		$browser->type("ext-comp-1032", "");
		$browser->type("ext-comp-1033", "");
		$browser->type("ext-comp-1034", "");
		$browser->click("ext-gen168");
		$this->assertTrue($browser->isAlertPresent());
		$this->assertEquals('/Form fields could not be submitted with empty values/', $browser->getAlert());
	}

	/*
	 * Failure Test
	 * Provided the required Connection field left blank
	 */
	public function testaddNewServerFailWithConnectionBlank(){
		$browser = $this->getBrowser();
		$browser->open("http://dblite.local/");
		$browser->click("ext-gen47");
		$browser->type("ext-comp-1029","");
		$browser->click("ext-gen151");
		$browser->click("//div[@id='ext-gen184']/div[1]");
		$browser->type("ext-comp-1030", "localhost");
		$browser->type("ext-comp-1031", "3306");
		$browser->type("ext-comp-1032", "root");
		$browser->type("ext-comp-1033", "");
		$browser->type("ext-comp-1034", "");
		$browser->click("ext-gen168");
		$browser->setSpeed("1000");
		$this->assertTrue($browser->isAlertPresent());
    $this->assertEquals('/Form fields could not be submitted with empty values/', $browser->getAlert());
	}

	/*
	 * Failure Test
	 * Provided the required Host Field left blank.
	 */
	public function testaddNewServerFailWithHostBlank(){
		$browser = $this->getBrowser();
		$browser->open("http://dblite.local/");
		$browser->click("ext-gen47");
		$browser->type("ext-comp-1029","Localhost");
		$browser->click("ext-gen151");
		$browser->click("//div[@id='ext-gen184']/div[1]");
		$browser->type("ext-comp-1030", "");
		$browser->type("ext-comp-1031", "3306");
		$browser->type("ext-comp-1032", "root");
		$browser->type("ext-comp-1033", "");
		$browser->type("ext-comp-1034", "");
		$browser->click("ext-gen168");
		$browser->setSpeed("1000");
		$this->assertTrue($browser->isAlertPresent());
    $this->assertEquals('/Form fields could not be submitted with empty values/', $browser->getAlert());
	}

	/*
	 * Failure Test
	 * Provided the required field Port left blank
	 */
	public function testaddNewServerFailWithPortBlank(){
		$browser = $this->getBrowser();
		$browser->open("http://dblite.local/");
		$browser->click("ext-gen47");
		$browser->type("ext-comp-1029","Localhost");
		$browser->click("ext-gen151");
		$browser->click("//div[@id='ext-gen184']/div[1]");
		$browser->type("ext-comp-1030", "localhost");
		$browser->type("ext-comp-1031", "");
		$browser->type("ext-comp-1032", "root");
		$browser->type("ext-comp-1033", "");
		$browser->type("ext-comp-1034", "");
		$browser->click("ext-gen168");
		$browser->setSpeed("1000");
		$this->assertTrue($browser->isAlertPresent());
    $this->assertEquals('/Form fields could not be submitted with empty values/', $browser->getAlert());
	}

	/*
	 * Failure Test
	 * Provided the required field Username left blank
	 */
	public function testaddNewServerFailWithUsernameBlank(){
		$browser = $this->getBrowser();
		$browser->open("http://dblite.local/");
		$browser->click("ext-gen47");
		$browser->type("ext-comp-1029","Localhost");
		$browser->click("ext-gen151");
		$browser->click("//div[@id='ext-gen184']/div[1]");
		$browser->type("ext-comp-1030", "localhost");
		$browser->type("ext-comp-1031", "3306");
		$browser->type("ext-comp-1032", "");
		$browser->type("ext-comp-1033", "");
		$browser->type("ext-comp-1034", "");
		$browser->click("ext-gen168");
		$browser->setSpeed("1000");
		$this->assertTrue($browser->isAlertPresent());
    $this->assertEquals('/Form fields could not be submitted with empty values/', $browser->getAlert());
	}

	/*
	 * Failure Test
	 * Test when 2 same connections exist with same name.
	 */
	public function testFailTwoSameConnections(){
		//Add new server 
		$this->addNewServer();
		$this->assertTrue($browser->isAlertPresent());
    $this->assertEquals('/Connection successful/', $browser->getAlert());
    //add new server with same details
		$this->addNewServer();  
		$this->assertTrue($browser->isAlertPresent());
    $this->assertEquals('/Connection already exists!/', $browser->getAlert());
  }
	
}
?>