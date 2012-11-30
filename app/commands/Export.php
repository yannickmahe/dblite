<?php

class Export {

	public function export_as_sql($params) {

		$dbname 	 	= $params['selected_db'];
		$export_type 	= $params['export_type'];
		$export_data 	= $params['export_data'];
		$export_options = $params['options'];
		$table_lists 	= $params['tables_lists'];
//		$conn_id 		= $params['connection_id'];

//		$server = Application::$data['servers'][$conn_id];
//		DB::setConnection($server->type, (array)$server);

		$this->driver = new MysqlDriver();

		header('Content-Disposition: attachment; filename="' . $dbname . "." . $export_type . '"');
		header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
		header("Content-type: text/$export_type");

		$export_options = array_unique(array_merge($export_options, (array)$export_data));
		$dump_options = '';
		$alltables = $this->driver->getTables($dbname);
		$tables = explode(",", $table_lists);
		$actual_tables = ($table_lists)? array_intersect($tables, $alltables) : $alltables;

		//get the views
		$views = $this->driver->getViews($dbname);
		$actual_tables = array_merge($actual_tables, $views);
		sort($actual_tables, SORT_STRING);

		$sqlExport = new SQLExport();

		$sqlExport->setConfigVars($export_options);
		$sqlExport->exportHeader();
		$sqlExport->exportStructComments("db", $dbname);
		$sqlExport->exportDBHeader($dbname);

		$view_tables = array();

		foreach($actual_tables as $table) {
			$alias_table = Utils::insertBackTicks($dbname).".".Utils::insertBackTicks($table);
			echo "\r\n";
			$is_view = $this->driver->isView($dbname, $table);
			$table_or_view = 'table';

			if($is_view) {
				$table_or_view = 'view';
				$view_tables[] = $table;
			}

			if(!$is_view) {
				$sqlExport->exportStructComments('table', $table);
				echo "\r\n";
				$sqlExport->exportStructure($table, $this->driver->getTableDDL($alias_table));
				//create triggers it is is present
				$sqlExport->exportTriggerStructure($dbname, $table, $this->driver);
				$sqlExport->exportData($alias_table, $table, $this->driver);
			}
			else {
				$columns = $this->driver->getTableFullColumns($alias_table);
				$sqlExport->exportViewStructure($table, $columns);
			}
			echo "\r\n";
		}

		if($view_tables) {
			$sqlExport->exportCreateView($view_tables, $dbname, $this->driver);
		}

		//check for FUNCTIONS and PROCEDURES
		$sqlExport->getRoutines($this->driver, $dbname);

		$sqlExport->exportFooter();
		exit;
	}

	public function export_table_data($params) {
		$dbname 		= $params['database'];
		$table 			= $params['selected_table'];
		$table_columns 	= explode(",", $params['table_columns']);

		$export_data 	= $params['export_data'];
		$export_table 	= $params['export_table'];
		$conn_id 		= $params['connection_id'];
//		$server = Application::$data['servers'][$conn_id];
//		DB::setConnection($server->type, (array)$server);
		$driver = new MysqlDriver();

		$file_name = ($table)? $dbname . "_". $table : $dbname;

		header('Content-Disposition: attachment; filename="' . $file_name ."." . $export_table . '"');
		header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
		header("Content-type: text/$export_table");

		$table_columns = Utils::insertBackTicks($table_columns);
		$table_columns = implode(",", $table_columns);

		if(empty($params['selected_sql'])) {
			$select_query = "SELECT $table_columns FROM $table";
		}
		else {
			$select_query = "SELECT $table_columns FROM ( " . $params['selected_sql'] . " ) AS a";
		}

		if($export_table == 'xml') {
			$this->exportAsXML($dbname, $table, $select_query, $driver);
		}
		else if($export_table == 'html') {
			$this->exportAsHTML($dbname, $table, $select_query, $driver);
		}
		else {
			$this->exportToCsv($select_query, $table_columns, $driver);
		}
		exit;
	}

	private function exportToCsv($sql_query, $table_columns, $driver)
	{
		header("Content-type: text/x-csv");

		$csv_terminated = "\n";
		$csv_separator = ",";
		$csv_enclosed = '"';
		$csv_escaped = "\\";

		//get DB connection
		$fields_cnt = explode(",", $table_columns);

		//fetch result rows
		$result_rows = $driver->executeExportQuery($sql_query);

		$schema_insert = '';

		foreach($fields_cnt as $key => $field) {
			$l = $csv_enclosed . str_replace($csv_enclosed, $csv_escaped . $csv_enclosed, stripslashes($field)) . $csv_enclosed;
			$schema_insert .= $l;
			$schema_insert .= $csv_separator;
		}

		$out = trim(substr($schema_insert, 0, -1));
		$out .= $csv_terminated;

		print $out;
		$schema_insert = '';
		$out = '';
		// Format the data
		while($row = $result_rows->fetch(PDO::FETCH_ASSOC)) {
			$schema_insert = '';
			foreach($fields_cnt as $key => $field) {
				$field = str_replace("`", "", $field);
				if ($row[$field] == '0' || $row[$field] != '')
				{
					if ($csv_enclosed == '')
					{
						$schema_insert .= $row[$field];
					}
					else
					{
						$schema_insert .= $csv_enclosed . str_replace($csv_enclosed, $csv_escaped . $csv_enclosed, $row[$field]) . $csv_enclosed;
					}
				}
				else
				{
					$schema_insert .= '';
				}

				if ($key < count($fields_cnt) - 1)
				{
					$schema_insert .= $csv_separator;
				}
			}
			$out .= $schema_insert;
			$out .= $csv_terminated;
		}

		print $out;
	}

	private function exportAsXML($dbname, $table, $query, $driver) {
		$xmlexport = new XMLExport();
		$xmlexport->exportHeader($dbname, $query, $table);
		$xmlexport->exportData($table, $query, $driver);
		$xmlexport->exportFooter();
	}

	private function exportAsHTML($dbname, $table, $query, $driver) {
		$htmlexport = new HTMLExport();
		$htmlexport->exportHeader($dbname, $query, $table);
		$htmlexport->exportData($table, $query, $driver);
		$htmlexport->exportFooter();
	}
}

?>
