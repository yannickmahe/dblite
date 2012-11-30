<?php

class ExportDBAsSQL extends SQLExport {
	
	private $dbname 		= '';
	private $export_type 	= '';
	private $export_data	= '';
	private $export_options	= '';
	private $table_lists	= '';
	private $conn_id		= '';
	public $driver 		= '';
	private $actual_tables 	= '';
	
	public function __construct($conn_id, $dbname, $export_type, $export_data, $export_options, $table_lists = '') {

		$this->dbname 			= $dbname;
		$this->export_type 		= $export_type;
		$this->export_data		= $export_data;
		$this->export_options	= $export_options;
		$this->table_lists		= $table_lists;	
		$this->conn_id			= $conn_id;
	}
	
//	public function setDbConn() {
//		$server_con = Application::$data['servers'][$this->conn_id];
//		$dbhost = $server_con->host;
//		$dbuser = $server_con->user;
//		$dbpass = $server_con->password;
//		$this->driver = new MysqlDriver();
//	}
	
	public function setHeader() {
		header('Content-Disposition: attachment; filename="' . $this->dbname . "." . $this->export_type . '"');
		header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
		header("Content-type: text/$this->export_type");
	}

	public function export() {
		$this->export_options = array_unique(array_merge($this->export_options, (array) $this->export_data));
		$dump_options = '';
		$alltables = $this->driver->getTables($this->dbname);
		$tables = explode(",", $this->table_lists);
		$this->actual_tables = ($this->table_lists)? array_intersect($tables, $alltables) : $alltables;

		$this->setConfigVars($this->export_options);
		$this->exportHeader();
		$this->exportStrutComments("db", $this->dbname);
		$this->exportDBHeader($this->dbname);

		foreach($this->actual_tables as $table) {
			$alias_table = $this->dbname.".".Utils::insertBackTicks($table);
			echo "\r\n";
			$this->exportStrutComments("table", $table);
			echo "\r\n";
			$this->exportStructure($table, $this->driver->getTableDDL($alias_table));
			$this->exportData($alias_table, $table, $this->driver);
			echo "\r\n";
		}

		$this->exportFooter();

	}
}
?>