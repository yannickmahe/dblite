<?php

class SQLExport {

	private $real_export_options;
	private $crlf = "\r\n";
	private $other_options = array();
	private $delimiter = ";;";
	private $tab = "\t";

	public function setConfigVars($request_options) {
		$export_options = array(ExportOptions::CREATE_DATABASE,
		ExportOptions::DROP_DATABASE,
		ExportOptions::DROP_TABLE,
		ExportOptions::COMPLETE_INSERT,
		ExportOptions::EXTENDED_INSERT,
		ExportOptions::ADD_COMMENTS,
		ExportOptions::ADD_AUTO_INCREMENT,
		ExportOptions::ADD_ROUTINES,
		ExportOptions::FOREIGN_KEY_CHECKS,
		ExportOptions::STRUCTURE,
		ExportOptions::DATA,
		ExportOptions::TESTING);

		$this->real_export_options = array_intersect($request_options, $export_options);
	}

	public function exportHeader() {

		$head = '';
		$head  .=  $this->commentPrefix('DBLite SQL Dump Version: '. VERSION)
		.  $this->commentPrefix('http://www.dblite.com');

		$time = time();
		$head .= $this->commentPrefix(date('M t, Y', $time). " at ". date('h:i A', $time));
		$head .= $this->crlf;

		$head .= "/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;" . $this->crlf .
				"/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;" . $this->crlf .
				"/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;" . $this->crlf .
				"/*!40101 SET NAMES utf8 */;" . $this->crlf .
				"/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;" . $this->crlf .
				"/*!40103 SET TIME_ZONE='+00:00' */;" . $this->crlf .
				"/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;" . $this->crlf;

		if(in_array(ExportOptions::FOREIGN_KEY_CHECKS, $this->real_export_options)) {
			$head .= "/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;" . $this->crlf;
		}

		$head .= "/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;" . $this->crlf .
				"/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;";

		$head .= $this->crlf;
		print $head;
	}

	public function exportDBHeader($dbname) {

		$db_header_text = $this->crlf;

		if(!in_array(ExportOptions::TESTING, $this->real_export_options)) {
			if(in_array(ExportOptions::DROP_DATABASE, $this->real_export_options)) {
				$db_header_text .= "/*!40000 DROP DATABASE IF EXISTS " . Utils::insertBackTicks($dbname) . "*/;";
				$db_header_text .= $this->crlf . $this->crlf;
			}

			if(in_array(ExportOptions::CREATE_DATABASE, $this->real_export_options)) {
				$db_header_text .= "CREATE DATABASE IF NOT EXISTS ". Utils::insertBackTicks($dbname) .";";
				$db_header_text .= $this->crlf . $this->crlf;
			}
			$db_header_text .= "USE " . Utils::insertBackTicks($dbname) .";";
			$db_header_text .= $this->crlf . $this->crlf;

			print $db_header_text;
		}
	}

	public function exportStructure($table, $structure, $table_key = 'table') {
		$table_data = '';

		$drop_key = ($table_key == 'table' || $table_key == 'view_data')? 'TABLE' : 'VIEW';
		$table_key = ($table_key == 'table')? 'TABLE' : 'VIEW';

		$drop_stmt = "DROP $drop_key IF EXISTS ". Utils::insertBackTicks($table) . ";". $this->crlf;
		$struct_stmt = $structure. ";". $this->crlf. $this->crlf;

		if($table_key == 'TABLE') {
			if(!in_array(ExportOptions::DATA, $this->real_export_options)) {
				if(in_array(ExportOptions::DROP_TABLE, $this->real_export_options)) {
					$table_data .= $drop_stmt;
				}
				$table_data .= $struct_stmt;
			}
		}
		else {
			$table_data .= $drop_stmt;
			$table_data .= $struct_stmt;
		}

		print $table_data;
	}

	public function exportViewStructure($table, $columns) {
		if(in_array(ExportOptions::ADD_ROUTINES, $this->real_export_options)) {
			
			$this->exportStructComments('view', $table);
			
			$structure = "CREATE TABLE IF NOT EXISTS ". Utils::insertBackTicks($table). " (";
			$structure .= $this->crlf;
	
			$field_str = '';
			if($columns) {
				$tot_count = count($columns);
				$i = 1;
				foreach($columns as $column) {
					$null_string = ($column->Null == 'NO')? 'NOT NULL' : 'NULL';
					$comma = ($i == $tot_count)? '' : ",";
					if($column->Default != '') {
						$default_str = $null_string. " DEFAULT ". Utils::insertQuotes($column->Default);
					}
					else if($null_string == 'NOT NULL') {
						$default_str = $null_string;
					}
					else {
						 $default_str = "DEFAULT ". $null_string;
					}
					
					$field_str .= " ". Utils::insertBackTicks($column->Field). " ". $column->Type. " ". $default_str. $comma;
					$field_str .= $this->crlf;
					$i++;
				}
			}
			$structure = $structure. $field_str. ")";
	
			$this->exportStructure($table, $structure, 'view');
		}
	}

	public function exportData($alias_table, $table, $driver) {

		if(!in_array(ExportOptions::STRUCTURE, $this->real_export_options)) {
				
			print $this->crlf. $this->exportStructComments("dump", $table). $this->crlf;
				
			$table_columns = Utils::insertBackTicks($driver->getTableColumnNames($alias_table));

			$insert_column_stmt = "INSERT INTO " . Utils::insertBackTicks($table);

			if(in_array(ExportOptions::COMPLETE_INSERT, $this->real_export_options) ||
			(in_array(ExportOptions::EXTENDED_INSERT, $this->real_export_options) && in_array(ExportOptions::COMPLETE_INSERT, $this->real_export_options))) {

				$insert_column_stmt .= 	" ( " . implode(', ', $table_columns ) . ")";
			}

			$insert_column_stmt .= " VALUES";

			$sql = "SELECT * FROM $alias_table";

			$data_stmt = $driver->executeExportQuery($sql);

			$columns_meta = $driver->getTableColumns($alias_table);

			$i = 0;
			$data = '';
			$flag = 1;
			$search       = array("\x00", "\x0a", "\x0d", "\x1a"); //\x08\\x09, not required
			$replace      = array('\0', '\n', '\r', '\Z');

			while($row = $data_stmt->fetch(PDO::FETCH_ASSOC)) {

				$row_values = array();
				$j = 0;
				foreach($row as $column_name => $column_value) {

					if($columns_meta[$j]->name == $column_name) {
						if(!isset($column_value) || is_null($column_value)){
							$row_values[$column_name] = 'NULL';
						}
						else if($columns_meta[$j]->binary) {
							$row_values[$column_name] = (empty($column_value) && $column_value != '0')? Utils::insertQuotes() : '0x' . bin2hex($column_value);
						}
						else if($columns_meta[$j]->type == 'bit') {
							$values[] = "b" . Utils::insertQuotes($column_value);
						}
						else if(($columns_meta[$j]->ctype == 'I' || $columns_meta[$j]->ctype == 'N') && (!stristr($columns_meta[$j]->type, 'SET'))) {
							$row_values[$column_name] = $column_value;
						}
						else {
							$row_values[$column_name] = str_replace($search, $replace, Utils::insertQuotes($column_value));
						}
					}
					$j++;
				}

				$tmp_data = '';

				if(in_array(ExportOptions::EXTENDED_INSERT, $this->real_export_options) ||
				(in_array(ExportOptions::EXTENDED_INSERT, $this->real_export_options) && in_array(ExportOptions::COMPLETE_INSERT, $this->real_export_options))) {

					$comma_separator = ($i != 0)? ",".$this->crlf : "";

					$tmp_data .= $comma_separator. "(";

					$tmp_data .= implode(", ", $row_values);

					$tmp_data .= ")";

					$data .= $tmp_data;

					$flag = 0;
				}
				else if(in_array(ExportOptions::COMPLETE_INSERT, $this->real_export_options) || (!in_array(ExportOptions::COMPLETE_INSERT, $this->real_export_options) && !in_array(ExportOptions::EXTENDED_INSERT, $this->real_export_options))) {

					$data .= $insert_column_stmt;

					$data .= "$comma_separator (";

					$data .= implode(", ", $row_values);

					$data .= ");". $this->crlf;
				}

				$i++;
			}

			$structure_data = ($flag) ? $data : $insert_column_stmt. $data .";";

			print $structure_data;
		}
	}

	public function exportRoutines() {

	}

	public function exportFooter() {

		$footer .= $this->crlf;

		$footer .= "/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;" . $this->crlf;
		if(in_array(ExportOptions::FOREIGN_KEY_CHECKS, $this->real_export_options)) {
			$footer .= "/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;" . $this->crlf;
		}

		$footer .= "/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;" . $this->crlf .
			"/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;" . $this->crlf .
			"/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;" . $this->crlf .
			"/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;" . $this->crlf .
			"/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;";

		$footer .= $this->crlf;

		print $footer;
	}

	public function commentPrefix($data = '') {

		if(in_array(ExportOptions::ADD_COMMENTS, $this->real_export_options)) {
			$comment_data = '--' . (empty($data) ? '' : ' ') . $data . $this->crlf;
		}
		else {
			$comment_data = '';
		}

		return $comment_data;
	}

	public function exportStructComments($type, $name) {

		$data = '';
		$data .= $this->commentPrefix();

		if($type == 'db') {
			$data .= $this->commentPrefix("Current Database: " . Utils::insertBackTicks($name));
		}
		else if($type == 'table') {
			$data .= $this->commentPrefix("Table structure for table " . Utils::insertBackTicks($name));
		}
		else if($type == 'dump') {
			$data .= $this->commentPrefix("Dumping data for table " . Utils::insertBackTicks($name));
		}
		else if($type == 'procedure') {
			$data .= $this->commentPrefix("Procedure structure for procedure " . Utils::insertBackTicks($name));
		}
		else if($type == 'function') {
			$data .= $this->commentPrefix("Function structure for function " . Utils::insertBackTicks($name));
		}
		else if($type == 'view') {
			$data .= $this->commentPrefix("Stand-in structure for view " . Utils::insertBackTicks($name));
		}
		else if($type == 'view_data') {
			$data .= $this->commentPrefix("Structure for view " . Utils::insertBackTicks($name));
		}
		else if($type == 'trigger') {
			$data .= $this->commentPrefix("Trigger " . Utils::insertBackTicks($name));
		}

		$data .= $this->commentPrefix();

		print $data;
	}

	public function getRoutines($driver, $dbname) {

		if(in_array(ExportOptions::ADD_ROUTINES, $this->real_export_options)) {
			$function_names = $driver->getRoutineNames($dbname, 'FUNCTION');
			$procedure_names = $driver->getRoutineNames($dbname, 'PROCEDURE');
				
			if($procedure_names) {
				foreach($procedure_names as $procedure_name) {
					$data = '';
					$data .= $this->exportStructComments("procedure", $procedure_name);
					$data .= $this->crlf;
					$data .= "DELIMITER ". $this->delimiter . $this->crlf . $this->crlf;
					$data .= "DROP PROCEDURE IF EXISTS ". Utils::insertBackTicks($dbname) . "." . Utils::insertBackTicks($procedure_name). ";";
					$data .= $this->crlf. $this->crlf;
					$procedure = $driver->getRoutineStructure('PROCEDURE', $procedure_name, $dbname). $this->delimiter;
					$data .= $procedure. $this->crlf. $this->crlf;
					$data .= "DELIMITER ;". $this->crlf. $this->crlf;
						
					print $data;
				}
			}
				
			if($function_names) {
				foreach($function_names as $function_name) {
					$data = '';
					$data .= $this->exportStructComments("function", $function_name);
					$data .= $this->crlf;
					$data .= "DELIMITER ". $this->delimiter . $this->crlf . $this->crlf;
					$data .= "DROP FUNCTION IF EXISTS ". Utils::insertBackTicks($dbname) . "." . Utils::insertBackTicks($function_name). ";";
					$data .= $this->crlf. $this->crlf;
					$procedure = $driver->getRoutineStructure('FUNCTION', $function_name, $dbname). $this->delimiter;
					$data .= $procedure. $this->crlf. $this->crlf;
					$data .= "DELIMITER ;". $this->crlf. $this->crlf;
						
					print $data;
				}
			}
		}
	}

	public function exportTriggerStructure($dbname, $table, $driver) {
		if(in_array(ExportOptions::ADD_ROUTINES, $this->real_export_options)) {
			$trigger_datas = $driver->getTriggerDatas($dbname, $table);

			if($trigger_datas) {
				$this->exportStructComments("trigger", $table);
				foreach($trigger_datas as $trigger_data) {
					$data = '';
					$data .= $this->crlf;
					$trigger_name = $trigger_data->TRIGGER_NAME;
					$action_timing = $trigger_data->ACTION_TIMING;
					$event_manipulation = $trigger_data->EVENT_MANIPULATION;
					$schema = $trigger_data->TRIGGER_SCHEMA;
					$object_schema = $trigger_data->EVENT_OBJECT_SCHEMA;
					$object_table = $trigger_data->EVENT_OBJECT_TABLE;
					$action_stmt = $trigger_data->ACTION_STATEMENT;
					$full_name = Utils::insertBackTicks($schema). "." . Utils::insertBackTicks($trigger_name);
						
					$data .= "DROP TRIGGER IF EXISTS $full_name;";
					$data .= $this->crlf;
					$data .= "DELIMITER ". $this->delimiter;
					$data .= $this->crlf;
					$data .= "CREATE TRIGGER ". $full_name. " ". $action_timing. " ". $event_manipulation. " ON ". Utils::insertBackTicks($object_schema). ".". Utils::insertBackTicks($object_table). $this->crlf;
					$data .= " FOR EACH ROW ". $action_stmt. $this->crlf;
					$data .= $this->delimiter. $this->crlf;
					$data .= "DELIMITER ;";
					$data .= $this->crlf;
						
					print $data;
				}
			}
		}
	}

	public function exportCreateView($view_tables, $dbname, $driver) {
		if(in_array(ExportOptions::ADD_ROUTINES, $this->real_export_options)) {		
			foreach($view_tables as $view_table) {
				$alias_table = Utils::insertBackTicks($dbname).".".Utils::insertBackTicks($view_table);
				$this->exportStructComments("view_data", $view_table);
				echo $this->crlf;
				$this->exportStructure($view_table, $driver->getTableDDL($alias_table, 'view'), "view_data");
				echo $this->crlf;
			}
		}
	}
}
?>
