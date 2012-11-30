<?php
/*
 * Execute Test class
 */
class ExecuteTester extends FwUnitTestCase {
	
	/*
	 * Success Test
	 * Provided with a success sql.
	 */
	public function testExecuteSuccess(){
		$browser = $this->getBrowser();
		$sql = "SELECT * from addresses";
		$browser->type("textarea",$sql);
		$browser->click("result");
	}
}
?>