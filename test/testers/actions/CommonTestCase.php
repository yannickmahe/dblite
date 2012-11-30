<?php
/*
 * Common Test class various scenario
 * include the function of LOGIN, REGISTER, MANAGE CONNECTION, LOGOUT
 */
class CommonTestCase extends FwUnitTestCase{


	public $browser;

	/*
	 * starting the browser
	 */
	public function loadUrl() {
		$this->browser = $this->getBrowser();
		$this->browser->open(MAIN_URL);
		$this->browser->setSpeed(1000);
	}

	/*
	 * handle the link as login, register etc to show the corresponding window.
	 * parameter is ID of corresponding link
	 */
	public function ClickLink($link_name) {
		$this->browser->click("//table[@id='$link_name']/tbody/tr[2]/td[2]/em/button");
	}

	/*
	 * handle ok button of dialog box
	 */
	public function clickOkButton() {
		$this->browser->click("//*[text()='OK']");
	}

	/******************** Common REGISTER CASE ****************************/
	/*
	 * All the common test cases related to REGISTER
	 */

	/*
	 * Created function for input the field of Register form
	 */
	public function Register($username=null, $pass=null, $repass=null, $email=null) {
		$this->browser->setSpeed(1000);
		$this->browser->type("//input[@name='register_username']",$username);
		$this->browser->type("//input[@name='register_password']",$pass);
		$this->browser->type("//input[@name='register_confpass']",$repass);
		$this->browser->type("//input[@name='register_email']",$email);
		$this->browser->click("//table[@id='dblite_form_register']/tbody/tr[2]/td[2]");
	}


	/******************** Common LOGIN CASES ****************************/

	/*
	 * All the common test cases related to LOGIN
	 */
	/*
	 * Created function for input the field of Login form
	 */
	public function Login($username=null, $pass=null){
		$this->browser->setSpeed(1000);
		$this->browser->type("//input[@name='username']",$username);
		$this->browser->type("//input[@name='password']",$pass);
		$this->browser->click("//table[@id='dblite_form_login']/tbody/tr[2]/td[2]/em/button");
	}


	/******************** LOGOUT CASE **********************************/

	/*
	 * Success test for logout
	 */
	public function Logout(){
		$this->browser->click("//table[@id='logout']/tbody/tr[2]/td[2]");
	}

	/******************** MANAGE INDEX CASES ****************************/

	/*
	 * All the common test cases related to MANAGE INDEXES
	 */
	public function AddConnection($conn=null, $host=null, $port=null, $username=null, $pass=null, $db=null) {
		$this->browser->setSpeed(3000);
		//		$this->browser->click("//*[text()='Manage Connections']");
		$this->browser->type("//input[@name='connection_id']",$conn);
		$this->browser->type("//input[@name='host']",$host);
		$this->browser->type("//input[@name='port']",$port);
		$this->browser->type("//input[@name='user']",$username);
		$this->browser->type("//input[@name='password']","");
		$this->browser->type("//input[@name='database']","");
		$this->browser->click("//*[text()='Test']");
	}

	/*
	 * trigger the login windiow and login the user
	 */
	public function loginUser($username, $password) {
		$this->ClickLink("dblite_login");
		$this->Login($username, $password);
		$this->browser->setSpeed(2000);
	}

	/*
	 * Manage connection success window
	 */
	public function ClickAddConnection(){
		$this->browser->click("//*[text()='Connect']");
		$this->assertsTrue($this->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->browser->getText("//span[@class='ext-mb-text']");
		if($msg == 'Connection updated successfully') {
			$this->assertEquals('Connection updated successfully', $msg);
		} else {
			$this->assertEquals('Connection name is already in use!', $msg);
		}
		$this->clickOkButton();
	}

	/*
	 * Show manage connection window and add the local server connection
	 */
	public function addNewConnection() {
		$this->AddConnection("local-server", "server", "3306", "root", "", "");
		$this->browser->setSpeed(2000);
		$this->assertsTrue($this->browser->isElementPresent("//div[@class=' x-window x-window-plain x-window-dlg']"));
		$msg = $this->browser->getText("//span[@class='ext-mb-text']");
		if($msg == 'Connection successful') {
			$this->assertEquals('Connection successful', $msg);
			$this->clickOkButton();
			$this->ClickAddConnection();
		} else {
			$this->assertEquals('Connection name is already in use!', $msg);
			$this->clickOkButton();
		}
	}

	/*
	 * select the particular connection from the grid
	 */
	public function ClickSavedConnection() {
		//$this->browser->runScript("Ext.Msg.alert('Info','ExtJs is working with your Selenium');");
		$this->browser->getEval("var records = Ext.getCmp('server-connection-grid').getStore().getCount();
		alert(records);");
	}

	/*
	 * Close the manage connection window
	 */
	public function closeManageConnWindow() {
		$this->browser->runScript('Ext.getCmp("add-server-win").hide();');
	}
	//var records = Ext.getCmp('server-connection-grid').getStore().getCount();
	//Ext.getCmp('server-connection-grid').getStore().selectFirstRow(records - 1);

	/*
	 * check the tables
	 */
	public function checkTables($driver, $dbname, $import_db_name) {
		$db1_tables = $driver->getTables($dbname);
		$db2_tables = $driver->getTables($import_db_name);
		$this->assertEquals(count($db1_tables), count($db2_tables), "The tables are not equal");
		$this->assertIdentical($db1_tables, $db2_tables, "The table names are not identical");
	}
	
	/*
	 * check table columns
	 */
	public function checkColumns($driver, $dbname, $import_db_name) {
		$db1_tables = $driver->getTables($dbname);
		$db2_tables = $driver->getTables($import_db_name);
		
		foreach($db1_tables as $key => $db1_table) {
			$db1_table_columns = $driver->getTableColumns($dbname. "." . $db1_table);
			$db2_table_columns = $driver->getTableColumns($import_db_name. "." . $db2_tables[$key]);
			$this->assertEquals(count($db1_table_columns), count($db2_table_columns), "The table columns are not equal");
			$this->assertIdentical($db1_table_columns, $db2_table_columns, "The table columns are not identical");
		}
	}
	
	/*
	 * check the table datas
	 */
	public function checkDatas($driver, $dbname, $import_db_name) {
		$db1_tables = $driver->getTables($dbname);
		$db2_tables = $driver->getTables($import_db_name);
		
		foreach($db1_tables as $key => $db1_table) {
			$table1_data = $driver->getQueryResults("SELECT * FROM $dbname.$db1_table;");
			$table2_data = $driver->getQueryResults("SELECT * FROM ". $import_db_name. "." .$db2_tables[$key]);
			$this->assertIdentical($table1_data, $table2_data, "The table datas are not equal");
		}
	}
	
	/*
	 * check the database charsets
	 */
	public function checkDatabaseCharsets($driver, $dbname, $import_db_name) {
		$charset1 = $driver->getCharsets($dbname);
		$charset2 = $driver->getCharsets($import_db_name);
		$this->assertIdentical($charset1, $charset2, "The databse charset is not identical");				
	}
	
	/*
	 * check the table keys
	 */
	public function checkTableKeys($driver, $dbname, $import_db_name) {
		$db1_tables = $driver->getTables($dbname);
		$db2_tables = $driver->getTables($import_db_name);
		
		foreach($db1_tables as $key => $db1_table) {
			$table1_keys = $driver->getTableKeys($dbname. "." .$db1_table);
			$table2_keys = $driver->getTableKeys($import_db_name. "." .$db2_tables[$key]);
			$this->assertIdentical($table1_keys, $table2_keys, "The table keys are not identical");
		}
	}
}
?>