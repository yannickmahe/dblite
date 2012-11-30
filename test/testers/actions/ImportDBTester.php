<?php
/*
 * database backup tester
 */

class ImportDBTester extends CommonTestCase {

	private $type 			= "mysql";	
	private $file_to_import = '';
	private $dbname 		= "manutest_db";
	private $import_db_name = "manutest_db2";
	private $config 		= array("host" => DB_HOST,
								"user" => DB_USER,
								"password" => DB_PASS);
	private $import_db_1	= 'manutest_db';
	private $import_db_2	= 'manutest_db2'; 
	private $driver			= '';
	
	public function ImportDBTester() {
		DB::setConnection($this->type, (array) $this->config);
		$this->driver = new MysqlDriver();
	}

	public function testImportInitialDB() {
 		$file = APPROOT. "/testers/data/dbimport_script.sql";
 		$sqlimport = $this->driver;
 		ob_start();
		$sqlimport->dropDatabase($this->dbname);		
		$sqlimport->createDatabase($this->dbname, '', '');
 		$sqlimport->import_db_using_binary($this->dbname, $file, DB_HOST, DB_USER, DB_PASS);
 		ob_get_clean(); 		
	}

	public function testImportActualDB() {
		$import_file = APPROOT. "/testers/data/dbimport_script.sql";
		$sqlimport = new ImportDBFromDump('', $import_file);
		$sqlimport->driver = $this->driver;
		$sqlimport->driver->dropDatabase($this->import_db_name);
		$sqlimport->driver->createDatabase($this->import_db_name, '', '');
		$sqlimport->driver->prepareAndExecuteSQL("USE $this->import_db_name");
		$sqlimport->importData();
	}

	public function testCheckTables() {
		$this->checkTables($this->driver, $this->dbname, $this->import_db_name);
	}
	
	public function testCheckColumns() {
		$this->checkColumns($this->driver, $this->dbname, $this->import_db_name);
	}
	
	public function testCheckDatas() {
		$this->checkDatas($this->driver, $this->dbname, $this->import_db_name);
	}
	
	public function testCheckDatabaseCharsets() {
		$this->checkDatabaseCharsets($this->driver, $this->dbname, $this->import_db_name);
	}
	
	public function testTableKeys() {
		$this->checkTableKeys($this->driver, $this->dbname, $this->import_db_name);
	}
		
}
?>