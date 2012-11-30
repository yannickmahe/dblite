<?php

class MysqlDriver extends DbDriver {

	protected function getConnection() {
		return DB::getConnection();
	}

	public function quotify($table) {
		$table = str_replace("`", "", $table);
		if(!strstr($table, ".")) {
			return "`$table`";
		}
		else {
			list($db, $table) = explode(".", $table);
			return "`$db`.`$table`";
		}
	}
	
//	public function createDatabase($name, $charset, $collation) {
//		$dbh = $this->getConnection();
//		$sql = "create database $name";
//		if($charset) $sql .= " character set $charset";
//		if($collation) $sql .= " collate $collation";
//		return $dbh->execute($sql);
//	}

	public function getDatabases(){
		$dbh = $this->getConnection();
		return $dbh->fetchCol("show databases", array(), 1);
	}

	public function getTables($database){
//		$dbh = $this->getConnection();
//		return $dbh->fetchCol("show tables from $database");

		$sql = "select `TABLE_NAME` from `INFORMATION_SCHEMA`.`TABLES` 
				where `TABLE_SCHEMA` = '". $database ."' 
				and `TABLE_TYPE` = 'BASE TABLE'";
		$dbh = $this->getConnection();
		return $dbh->fetchCol($sql, array(), 1);
		
	}

	public function getTables1($database){
		$dbh = $this->getConnection();
		return $dbh->fetchAll("show tables from `$database`", array(), 1);
	}

	public function getCharsets() {
		$dbh = $this->getConnection();
		return $dbh->fetchCol("show character set", array(), 1);
	}

	public function getCollations() {
		$dbh = $this->getConnection();
		return $dbh->fetchCol("show collation", array(), 1);
	}

	public function getSelectResults($sql, $limit) {
		$dbh = $this->getConnection();
		$starttime = microtime(true);
		$stmt = $dbh->prepareAndQuery($sql, array(), 1);
		$endtime = microtime(true);
		$timetaken = $endtime - $starttime;
		$rows = array();
		$columns = array();
		$row = $stmt->fetch(PDO::FETCH_OBJ);
		if(!$row) {
			$i = 0;
			while($column = $stmt->getColumnMeta($i)) {
				$columns[] = $column['name'];
				$i++;
			}
			return array($rows, $columns, $timetaken, 0);
		}
		$columns = array_keys((array)$row);
		$rows[] = $row;
		$i = 1;
		while($row = $stmt->fetch(PDO::FETCH_OBJ)) {
			if($i++ >= $limit) {
				$stmt->closeCursor();
				//$rs1 = $dbh->query('SELECT FOUND_ROWS()');
				//$i = (int) $rs1->fetchColumn();
				break;
			}
			$rows[] = $row;
		}
		return array($rows, $columns, $timetaken, $i);
	}

	public function getQueryResults($sql) {
		$dbh = $this->getConnection();
		return $dbh->fetchAll($sql);
	}

	public function getQueryResultColumns($sql) {
		$dbh = $this->getConnection();
		$stmt = $dbh->prepare($sql);
		$stmt->execute(array());
		$i = 0;
		while($column = $stmt->getColumnMeta($i)) {
			$columns[] = $column;
			$i++;
		}
		return $columns;
	}

	public function getTableStatus($database) {
		$dbh = $this->getConnection();
		return $dbh->fetchAll("show table status from `$database`", array(), 1);
	}


	public function getTableView($database) {
		$dbh = $this->getConnection();
		$sql  = "select table_name as View_name, View_definition, Check_option, Is_updatable, Definer, Security_type
				 from information_schema.views
 				 where table_schema = '$database'";
		return $dbh->fetchAll($sql, array(), 1);
	}

	public function getDatabaseDDL($database) {
		$dbh = $this->getConnection();
		return $dbh->fetchAll("show create database `$database`", array(), 1);
	}

	public function getTableFullFields($table) {
		$dbh = $this->getConnection();
		$table = $this->quotify($table);
		return $dbh->fetchAll("show full fields from $table", array(), 1);
	}

	public function getTableKeys($table) {
		$dbh = $this->getConnection();
		$table = $this->quotify($table);
		return $dbh->fetchAll("show keys from $table", array(), 1);
	}

	public function dropIndexes($indexes, $table) {
		$output = new stdClass();
		$output->success = true;
		$dbh = $this->getConnection();

		$dbh->beginTransaction();
		$table = $this->quotify($table);
		try {
			foreach($indexes as $index) {
				if(strtolower($index) == 'primary') {
					$dbh->prepareAndExecute("alter table $table drop PRIMARY key", array(), 1);
				} else {
					$dbh->prepareAndExecute("alter table $table drop key `$index`", array(), 1);
				}
			}
		}
		catch(Exception $e) {
			$dbh->rollback();
			$output->success = false;
			$output->msg = $e->getMessage();
			return $output;
		}
		$dbh->commit();
		return $output;

		//		$dbh = $this->getConnection();
		//		foreach($indexes as $index) {
		//			if($index == 'PRIMARY') {
		//				$reply = $dbh->query("alter table $table drop PRIMARY key");
		//			} else {
		//				$reply = $dbh->query("alter table $table drop key `$index`");
		//			}
		//		}
	}

	public function editIndex($indexes, $table, $indexType, $indexName, $originalName) {
		$dbh = $this->getConnection();
		$output = new stdClass();
		$output->success = true;


		// Get the drop index query
		if($originalName == 'PRIMARY') {
			$dropIndexQuery = "drop PRIMARY key";
		} else {
			$dropIndexQuery = "drop key `$originalName`";
		}

		// Get the create index query
		if($indexType == 'primary') {
			$addIndexQuery = "add PRIMARY key (".implode(',',$indexes).")";
		} else {
			$indexType = ($indexType=='none')?'index':$indexType;
			$addIndexQuery = "add $indexType `$indexName` (".implode(',',$indexes).")";
		}

		$table = $this->quotify($table);
		$query = "alter table $table $dropIndexQuery, $addIndexQuery";

		try {
			$dbh->prepareAndExecute($query, array(), 1);
		}
		catch(Exception $e) {
			$output->success = false;
			$output->msg = $e->getMessage();
		}

		return $output;


		//		Logger::info($query);
		//		$dbh = $this->getConnection();
		//		$reply = $dbh->query($query);
		//		Logger::info($reply);
		//		return $reply;
	}

	public function createIndexes($indexes, $table, $indexType, $indexName) {

		/*
		 * For adding a simple index on columns
		 * alter table <database>.<table> add index <indexName> (<column1>,<column2>...);
		 * For adding a primary key on columns
		 * alter table <database>.<table> add PRIMARY key (<column1>, <column2>, <column3>...);
		 * For adding a fulltext key on columns
		 * alter table <database>.<table> add fulltext <indexName> (<column1>, <column2>, <column3>...);
		 * For adding a unique key on columns
		 * alter table <database>.<table> add unique <indexName> (<column1>, <column2>, ...);
		 */

		$table = $this->quotify($table);
		switch($indexType) {
			case 'none':
				$query = "alter table $table add index `$indexName` (".implode(',',$indexes).")";
				break;
			case 'primary':
				$query = "alter table $table add PRIMARY key (".implode(',',$indexes).")";
				break;
			case 'fullText':
				$query = "alter table $table add fulltext `$indexName` (".implode(',',$indexes).")";
				break;
			case 'unique':
				$query = "alter table $table add unique `$indexName` (".implode(',',$indexes).")";
				break;
			default:
				return false;
		}

		if($query) {
			$output = new stdClass();
			$output->success = true;

			$dbh = $this->getConnection();
			try {
				$dbh->prepareAndExecute($query, array(), 1);
			}
			catch(Exception $e) {
				$output->success = false;
				$output->msg = $e->getMessage();
			}

			return $output;

		}
	}

	public function getTableDDL($table, $table_or_view = 'table') {
		$dbh = $this->getConnection();
		$table = $this->quotify($table);
		$rows = $dbh->fetchAll("show create $table_or_view $table", array(), 1);
		$row = (array)$rows[0];
		$column_name = ($table_or_view == 'table')? 'Create Table' : 'Create View'; 
		return $row[$column_name];
	}
	
	public function getTableFullColumns($table) {
		$dbh = $this->getConnection();
		$table = $this->quotify($table);
		$full_columns = $dbh->fetchAll("show full columns from $table");
		return $full_columns;
	}

	public function getTableColumnNames($table) {
		$dbh = $this->getConnection();
		$table = $this->quotify($table);
		$fields = $dbh->fetchAll("show columns from $table", array(), 1);
		$column_names = array();
		foreach($fields as $field) {
			$column_names[] = $field->Field;
		}
		return $column_names;
	}
	public function getTableColumns($table) {
		$dbh = $this->getConnection();
		$table = $this->quotify($table);
		$stmt = $dbh->prepareAndQuery("show columns from $table", array(), 1);
		$rows = $stmt->fetchAll(PDO::FETCH_NUM);
		$columns = array();
		foreach($rows as $row) {
			$columns[] = $this->createColumnObject($row);
		}
		return $columns;
	}

	public function createColumnObject($row) {
		$fld = new stdClass;
		$fld->name = $row[0];
		$type = $row[1];
		$fld->multi_set = array();
		// split type into type(length):
		$fld->scale = null;
		if (preg_match("/^(.+)\((\d+),(\d+)/", $type, $query_array)) {
			$fld->type = $query_array[1];
			$fld->max_length = is_numeric($query_array[2]) ? $query_array[2] : -1;
			$fld->scale = is_numeric($query_array[3]) ? $query_array[3] : -1;
		} elseif (preg_match("/^(.+)\((\d+)/", $type, $query_array)) {
			$fld->type = $query_array[1];
			$fld->max_length = is_numeric($query_array[2]) ? $query_array[2] : -1;
		} elseif (preg_match("/^(enum|set)\((.*)\)$/i", $type, $query_array)) {
			$fld->type = $query_array[1];
			$arr = explode(",",$query_array[2]);
			$fld->enums = $arr;
			foreach($arr as $val) {
				$new_val = trim($val, "'");
				$new_val = trim($new_val, '"');
				$fld->multi_set[] = array($new_val); 
			}
			$zlen = max(array_map("strlen",$arr)) - 2; // PHP >= 4.0.6
			$fld->max_length = ($zlen > 0) ? $zlen : 1;
		} else {
			$fld->type = $type;
			$fld->max_length = -1;
		}
		$fld->not_null = ($row[2] != 'YES');
		$fld->primary_key = ($row[3] == 'PRI');
		$fld->unique_key = ($row[3] == 'UNI');
		$fld->auto_increment = (strpos($row[5], 'auto_increment') !== false);
		$fld->binary = (strpos($type,'blob') !== false || strpos($type,'binary') !== false);
		$fld->unsigned = (strpos($type,'unsigned') !== false);
		$fld->zerofill = (strpos($type,'zerofill') !== false);
		if (!$fld->binary) {
			$d = $row[4];
			if ($d != '' && $d != 'NULL') {
				$fld->has_default = true;
				$fld->default_value = $d;
			} else {
				$fld->has_default = false;
			}
		}
		$fld->ctype = $this->translateType($fld->type);
		return $fld;
	}

	public function translateType($t)
	{
		switch (strtoupper($t)) {
			case 'STRING':
			case 'CHAR':
			case 'VARCHAR':
			case 'TINYBLOB':
			case 'TINYTEXT':
			case 'ENUM':
			case 'SET':
				return 'C';
			case 'TEXT':
			case 'LONGTEXT':
			case 'MEDIUMTEXT':
				return 'X';
			case 'IMAGE':
			case 'LONGBLOB':
			case 'BLOB':
			case 'MEDIUMBLOB':
			case 'BINARY':
				return 'B';
			case 'YEAR':
			case 'DATE':
				return 'D';
			case 'TIME':
			case 'DATETIME':
			case 'TIMESTAMP':
				return 'T';
			case 'INT':
			case 'INTEGER':
			case 'BIGINT':
			case 'TINYINT':
			case 'MEDIUMINT':
			case 'SMALLINT':
				return 'I';
			default: return 'N';
		}
	}

	public function insertTableRow($table, $data) {
		$dbh = $this->getConnection();
		return $dbh->insert($table, $data, 0, 1);
	}

	public function getAffectedRowCount($sql, $data = '') {
		$dbh = $this->getConnection();
		return $dbh->fetchSingleColumn($sql, $data);

	}

	public function updateTableRow($table, $data, $where, $where_data) {
		$dbh = $this->getConnection();
		return $dbh->update($table, $data, $where, $where_data, 1);
	}

	public function deleteTableRow($sql, $data) {
		$dbh = $this->getConnection();
		return $dbh->prepareAndExecute($sql, $data, 1);
	}

//	public function dropDatabase($database) {
//		$dbh = $this->getConnection();
//		return $dbh->prepareAndExecute("drop database if exists $database");
//	}

	public function truncateTable($table){
		$dbh = $this->getConnection();
		$table = $this->quotify($table);
		return $dbh->prepareAndExecute("truncate table $table", array(), 1);
	}

	public function import_db_using_binary($dbname, $dump_db, $dbhost, $dbuser, $dbpass) {
		$output = new stdClass();
		try {
			//			$server_con = Application::$data['servers'][$_REQUEST['connection_id']];
			//			$dbhost = $server_con->host;
			//			$dbuser = $server_con->user;
			//			$dbpass = $server_con->password;

			$dbname = ($dbname == 'none')? '' : $dbname;
			if(strtoupper(substr(PHP_OS, 0, 3)) == "WIN") {
				$command = APPROOT. "/binaries/mysql/windows/mysql --host=$dbhost --user=$dbuser --password=$dbpass $dbname < $dump_db";
			}
			else {
				$command = "mysql --host=$dbhost --user=$dbuser --password=$dbpass $dbname < $dump_db";
			}
			$result = system($command, $retval);
			$output->success = ($retval)? false : true;
		}
		catch(Exception $e) {
			Logger::info($e);
			$output->success = false;
			$output->msg = $e->getMessage();
			return $output;
		}
		return $output;
	}

	public function import_db($sql) {
		$output = new stdClass();
		try {
			$dbh = $this->getConnection();
			$dbh->prepareAndExecute($sql);
			$output->success = true;
		}
		catch(Exception $e) {
			$output->msg = $e->getMessage();
			$output->success = false;
		}
		return $output;
	}

	public function truncateDatabase($database){
		$output = new stdClass();
		$output->success = true;
		$tables = $this->getTableStatus($database);
		$dbh = $this->getConnection();

		$dbh->beginTransaction();
		try {
			foreach($tables as $table) {
				$this->truncateTable($database.".".$table->Name);
			}
		}
		catch(Exception $e) {
			$dbh->rollback();
			$output->success = false;
			$output->msg = $e->getMessage();
			return $output;
		}
		$dbh->commit();
		return $output;
	}

	public function dropTable($table){
		$dbh = $this->getConnection();
		$table = $this->quotify($table);
		return $dbh->prepareAndExecute("drop table $table", array(), 1);
	}

	public function emptyDatabase($database){
		$output = new stdClass();
		$output->success = true;
		$tables = $this->getTableStatus($database);
		$dbh = $this->getConnection();

		$dbh->beginTransaction();
		try {
			foreach($tables as $table) {
				$this->dropTable($database.".".$table->Name);
			}
		}
		catch(Exception $e) {
			$dbh->rollback();
			$output->success = false;
			$output->msg = $e->getMessage();
			return $output;
		}
		$dbh->commit();
		return $output;
	}

	public function renameTable($table, $name) {
		$dbh = $this->getConnection();
		$table = $this->quotify($table);
		return $dbh->prepareAndExecute("rename table $table to $name", array(), 1);
	}

	public function prepareAndExecuteSQL($sql, $bind=array()) {
		$dbh = $this->getConnection();
		return $dbh->prepareAndExecute($sql, $bind);
	}

	public function getTableAdvancedProperties($database, $table) {
		$dbh = $this->getConnection();
		return $dbh->fetchSingleRow("show table status from `$database` like '$table'", array(), 1);
	}

	public function getTableRowCount($table) {
		$dbh = $this->getConnection();
		$table = $this->quotify($table);
		return $dbh->fetchSingleColumn("select count(*) from $table", array(), 1);
	}



	public function executeExportQuery($query) {
		$dbh = $this->getConnection();
		$stmt = $dbh->prepareAndQuery($query);
		return $stmt;
	}

	public function queryData($sql, $bind=array(), $limit=""){
		$dbh = $this->getConnection();
		if(!$limit) {
			return $dbh->fetchAll($sql, $limit);
		}
		else {
			if($limit == 1) {
				return $dbh->fetchSingleRow($sql, $bind, $limit);
			}
			else {
				return $dbh->fetchRows($sql, $bind, $limit);
			}
		}
	}

	public function getDbTablesAndColumns($database) {
		$sql = "select table_name, column_name
				from `information_schema`" . "." . "`columns`
		     	where table_schema = '$database'";
		$output = $this->getQueryResults($sql);
		$tables = array();
		if(!empty($output)) {
			foreach($output as $column) {
				if(!array_key_exists($column->table_name, $tables)) {
					$tables[$column->table_name] = array($column->column_name);
				} else {
					$tables[$column->table_name][] = $column->column_name;
				}
			}
		}
		return $tables;
	}
	
	public function getViews($database){
		$sql = "select `TABLE_NAME` from `INFORMATION_SCHEMA`.`TABLES` 
				where `TABLE_SCHEMA` = '". $database ."' 
				and `TABLE_TYPE` = 'VIEW'";
		$dbh = $this->getConnection();
		return $dbh->fetchCol($sql);
	}
	
	public function getTriggerDatas($dbname, $table) {
		$trigger_sql = "SELECT TRIGGER_SCHEMA, TRIGGER_NAME, EVENT_MANIPULATION, ACTION_TIMING, ACTION_STATEMENT, EVENT_OBJECT_SCHEMA, EVENT_OBJECT_TABLE FROM INFORMATION_SCHEMA.TRIGGERS WHERE TRIGGER_SCHEMA= ". Utils::insertQuotes($dbname) ." and EVENT_OBJECT_TABLE = ". Utils::insertQuotes($table).";";
		$dbh = $this->getConnection();
		return $dbh->fetchAll($trigger_sql);
	}
	 
	public function isView($dbname, $table) {
		$sql = "SELECT table_type FROM INFORMATION_SCHEMA.TABLES WHERE table_schema = ". Utils::insertQuotes($dbname) . " AND table_name LIKE ". Utils::insertQuotes($table). ";";
		$dbh = $this->getConnection(); 
		$view_status = $dbh->fetchSingleColumn($sql);
		$view = 0;
		if($view_status == 'VIEW') {
			$view = 1;
		}
		
		return $view;
	}
	
	public function getRoutineNames($dbname, $routine_name) {
		$dbh = $this->getConnection();
		$routine_obj = $dbh->fetchAll("SHOW $routine_name STATUS;");

		$routine_names = array();
		if($routine_obj) {
			foreach($routine_obj as $routine) {
				if($routine->Db == $dbname && $routine->Type == $routine_name) {
					$routine_names[] = $routine->Name;	
				}
			}
		}
		return $routine_names;
	}
	
	public function getRoutineStructure($routine_var, $routine_name, $dbname) {
		$dbh = $this->getConnection();
		$sql = "SHOW CREATE $routine_var ". Utils::insertBackTicks($dbname) . "." . Utils::insertBackTicks($routine_name);
		
		$routine_struct = $dbh->fetchSingleRow($sql);
		$procedure_col = ($routine_var == 'PROCEDURE')? "Create Procedure" : "Create Function";
		
		return $routine_struct->$procedure_col;
	}
	
}

?>