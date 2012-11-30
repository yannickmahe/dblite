<?php

class Database {

	public function Database() {
		$this->driver = new MysqlDriver();
	}
	public  function execute_query($params) {
		$sql = $params['sql'];
		$output = new stdClass;
		$output->success = true;

		// check for demo version
		$is_demo_version = Utils::checkForDemoVersion();
		if($is_demo_version) {
			$is_restricted_command = Utils::checkForRestrictedCommands($sql);
			if($is_restricted_command) {
				throw new Exception("This feature is not available in demo version. <br /> Please <a href='http://dblite.com/download' target='_blank'>download</a> the full version or <a href='http://user.dblite.com' target='_blank'>register</a> with us.");
				return;
			}
		}

		$dbh = DB::getConnection();
		$dbh->prepareAndExecute($sql, array(), 1);
		return $output;
	}

	public function select_query($params) {
		$sql = $params['sql'];
		$cols = isset($params['cols'])?$params['cols']:"";
		$output = new stdClass;
		$output->success = true;
		$dbh = DB::getConnection();
		$stmt = $dbh->prepareAndQuery($sql, array(), 1);
		if($cols) {
			$i=0;
			$columns = array();
			while($column = $stmt->getColumnMeta($i)) {
				$columns[] = $column['name'];
				$i++;
			}
			$output->columns = $columns;
		}
		$output->result = $stmt->fetchAll(PDO::FETCH_NUM);
		return $output;
	}

	public function select_queries($params) {
		$sqls = $params['sqls'];
		$output = new stdClass;
		$output->success = true;
		$results = array();
		$dbh = DB::getConnection();
		foreach($sqls as $sql) {
			$stmt = $dbh->prepareAndQuery($sql, array(), 1);
			$results[] = $stmt->fetchAll(PDO::FETCH_NUM);
		}
		$output->results = $results;
		return $output;
	}

	private function execute_select_query($sql) {
		$output = new stdClass();
		$output->columns = array();
		$output->rows = array();
		$output->sql = $sql;

		list($rows, $columns, $time, $total) = $this->driver->getSelectResults($sql, 50);
		$output->execution_time = round($time/1000, 3) . " ms";
		$output->num_records = $total . " row(s)";
		
		foreach($columns as $column) {
			$c = new stdClass();
			$c->header = $column;
			$c->id = $column;
			$c->dataIndex = $column;
			$c->width = (strlen($c->header) * 8) + 25;
			$output->columns[] = $c;
			$output->cols[] = $column;
		}

		foreach($rows as $row) {
			$arr =(array)$row;
			$output->rows[] = array_values($arr);
			$i=0;
			foreach($arr as $key=>$value) {
				if((strlen((string)$value) * 8) > $output->columns[$i]->width) {
					$output->columns[$i]->width = strlen((string)$value) * 8 ;
				}
				$i++;
			}
		}

		return $output;
	}

	private function execute_dml_query($sql) {
		$output = new stdClass();
		$output->sql = $sql;
		$starttime = microtime();
		$affected_rows = $this->driver->prepareAndExecuteSQL($sql, array(), 1);
		$endtime = microtime();
		$execution_time = round(($endtime-$starttime)/1000, 3) . " ms taken";
		$output->execution_status = $affected_rows . " row(s) affected " . " <br /> " .$execution_time;
		return $output;
	}

	public function execute_queries($params) {
		
		$database  = $params['database'];
		$query_str = $params['sql'];
		$sql_delim = $params['sqldelim'];

		// check for demo version
		$is_demo_version = Utils::checkForDemoVersion();
		if($is_demo_version) {
			$is_restricted_command = Utils::checkForRestrictedCommands($query_str);
			if($is_restricted_command) {
				throw new Exception("This feature is not available in demo version. <br /> Please <a href='http://dblite.com/download' target='_blank'>download</a> the full version or <a href='http://user.dblite.com' target='_blank'>register</a> with us.");
				return;
			}
		}


		$sql_arr = explode($sql_delim, $query_str);
		$result = array();

		foreach(array_filter($sql_arr) as $sql){
			
			$sql = trim($sql);
			
			if(!$sql) continue;
			try {
				// check for select/show query
				if(preg_match("/^(select|show|explain)[\s]+/i", $sql)) {
					$rand_str = Utils::getRandomStr();
					$output = $this->execute_select_query($sql);
					$output->result_separator = $rand_str;
					$output->hasError = false;
					$output->isSelectSQL = true;
				}
				else {
					$output = $this->execute_dml_query($sql);
					$output->hasError = false;
					$output->isSelectSQL = false;
				}

				$result[] = $output;
			}
			catch(Exception $e) {
				$output = new stdClass();
				$output->hasError = true;
				$output->sql = $sql;
				$output->msg = $e->getMessage();
				$result[] = $output;
			}
		}
		return $result;
	}
}

?>
