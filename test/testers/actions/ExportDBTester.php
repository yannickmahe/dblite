<?php
/*
 * database backup tester
 */

class ExportDBTester extends CommonTestCase {

	private $type 			= "mysql";
	private $dbname 		= "manutest_db";
	private $import_db_name = "manutest_db2";
	private $export_type 	= "sql";
	private $file_to_import = '';
	private $conn_id 		= '';
	private $export_data	= '';
	private $config 		= array("host" => DB_HOST,
							"user" => DB_USER,
							"password" => DB_PASS);
	private $driver			= '';
	
	private $export_options	= array(ExportOptions::TESTING,
								ExportOptions::DROP_TABLE,
								ExportOptions::COMPLETE_INSERT,
								ExportOptions::EXTENDED_INSERT,
								ExportOptions::ADD_COMMENTS,
								ExportOptions::FOREIGN_KEY_CHECKS,
								ExportOptions::ADD_AUTO_INCREMENT,
								ExportOptions::ADD_ROUTINES);
								
	public function ExportDBTester() {
		DB::setConnection($this->type, (array) $this->config);
 		$this->driver = new MysqlDriver();
	}								
								
	public function testCreateDBToExport() {
 		$file = APPROOT. "/testers/data/dbimport_script.sql";
		$this->driver->dropDatabase($this->dbname);		
		$this->driver->createDatabase($this->dbname, '', '');
 		$this->driver->import_db_using_binary($this->dbname, $file, DB_HOST, DB_USER, DB_PASS); 		
	}								
		
	public function testExportDBWithStructure() {
		$file = APPROOT . "/testers/tmp/export_db_structure.sql";
		$this->export_data = ExportOptions::STRUCTURE;
		$export_options = array_merge($this->export_options, array(ExportOptions::STRUCTURE));
		$sqlexport = new ExportDBAsSQL($this->conn_id, $this->dbname, $this->export_type, $this->export_data, $export_options, '');
		$sqlexport->driver = $this->driver;

		ob_start();
		$sqlexport->export();
		$content = ob_get_contents();
		ob_end_clean();
		file_put_contents($file, $content);
	}
	
	public function testExportDBWithData() {
		$file = APPROOT . "/testers/tmp/export_db_data.sql";
		$this->export_data = ExportOptions::DATA;
		$export_options = array_merge($this->export_options, array(ExportOptions::DATA));
		$sqlexport = new ExportDBAsSQL($this->conn_id, $this->dbname, $this->export_type, $this->export_data, $export_options, '');
		$sqlexport->driver = $this->driver;
		
		ob_start();
		$sqlexport->export();
		$content = ob_get_contents();
		ob_end_clean();
		file_put_contents($file, $content);
	}
	
	public function testExportDBWithBoth() {
		$file = APPROOT . "/testers/tmp/export_db_both.sql";
		$this->export_data = '';
		$sqlexport = new ExportDBAsSQL($this->conn_id, $this->dbname, $this->export_type, $this->export_data, $this->export_options, '');
		$sqlexport->driver = $this->driver;
		
		ob_start();
		$sqlexport->export();
		$content = ob_get_contents();
		ob_end_clean();
		file_put_contents($file, $content);
		
	}

	public function testImportLocalDB() {
		$this->file_to_import = APPROOT. "/testers/tmp/export_db_both.sql";
		$this->driver->dropDatabase($this->import_db_name);		
		$this->driver->createDatabase($this->import_db_name, '', '');
		$this->driver->import_db_using_binary($this->import_db_name, $this->file_to_import, DB_HOST, DB_USER, DB_PASS);
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