<?php

class DBExpr{
	private $expr;
	public function DBExpr($expr) {
		$this->expr = $expr;
	}
	public function toString() {
		return $this->expr;
	}
}

class DBStatement extends PDOStatement {
	public $dbh;
	protected function __construct($dbh) {
		$this->dbh = $dbh;
		$this->setFetchMode(PDO::FETCH_OBJ);
	}
}

class DB {

	protected $dbh;
	private static $connections = array();
	public static $currConnection;

	const TYPE_MYSQL = "mysql";
	const TYPE_SQLITE = "sqlite";

	public function DB($dsn, $user="", $pass="", $persistent=false) {
		try {
			$this->dbh = new PDO($dsn, $user, $pass, array(PDO::ATTR_PERSISTENT => $persistent));
			//$this->dbh->setAttribute(PDO::ATTR_STATEMENT_CLASS, array('DBStatement', array($this->dbh)));
			$this->dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		}
		catch(Exception $e) {
			throw new Exception($e->getMessage());
		}
	}

	public static function setConnection($type, $config) {
		self::$currConnection = array("type" => $type, "config" => $config);

	}

	private static function setConnectionDetails() {
		 
		
		$params = (array)json_decode($_REQUEST['params']);
		if(isset($params['database'])) { $_REQUEST['database'] =  $params['database']; }

		if(!empty($_REQUEST['connection_id']) && $_REQUEST['connection_id'] != 'null') {
			//$server = Application::$data['servers'][$_REQUEST['connection_id']];
			$server = UserUtils::getUserConnection($_REQUEST['connection_id']);

			if(!$server) {
				throw new Exception("Could not find the details for the connections [" . $_REQUEST['connection_id']. "]. Try refreshing the page or logout and login again.");
			}
			if(empty($server->save_password)) {
				$passwords = Session::read('passwords');
				$server->password = $passwords[$_REQUEST['connection_id']];
			}
			if(isset($_REQUEST['database'])) {
				$server->database = $_REQUEST['database'];
			}
			DB::setConnection($server->type, (array)$server);
		}
	}

	public static function getConnection($type="", $config="") {
	
		if(empty($type) || empty($config)) {
			self::setConnectionDetails();
			if(empty(self::$currConnection)) {
				throw new Exception("Connection must be set first");
			}
			list($type, $config) = array_values(self::$currConnection);
		}

		$key = "$type;" . implode(";", array_values($config));
		
		$conn = isset(self::$connections[$key])?self::$connections[$key]:"";

		if(!$conn) {
			if($type == DB::TYPE_MYSQL) {
				$host = $config['host'];
				$user = isset($config['user']) ? $config['user'] : "";
				$pass = isset($config['password']) ? $config['password'] : "";
				$name = isset($config['database']) ? $config['database'] : "";
				$port = isset($config['database']) ? $config['database'] : "3306";
				$dsn = "$type:host=$host;dbname=$name;port=$port";
				$conn = new DB($dsn, $user, $pass);
				$start_time = microtime(true);
				$conn->execute("set names 'utf8'");
				$end_time = microtime(true);
				//UserUtils::logIntoHistory($start_time, $end_time, "set names 'utf8'", "success");
			}
			else if($type == DB::TYPE_SQLITE) {
				$file = $config['file'];
				$dsn = "sqlite:";
				$extension = end(explode(".", $file));
				if($extension == "sq2") $dsn = "sqlite2:";
				if(empty($file) || !file_exists($file)) {
					$ret = touch($file);
					if($ret) $ret = chmod($file, 0755);
					if(!$ret) {
						throw new Exception("Failed to create a writable database at [$file]");
					}

				}
				if(!is_writable($file)) {
					$ret = chmod($file, 0755);
					if(!$ret) {
						throw new Exception("Failed to open/create a writable database at [$file]");
					}
				}
				$dsn .= "$file";	
				$conn = new DB($dsn);
			}
			else {
				throw new Exception("Database type [$type] not supported yet");
			}
			self::$connections[$key] = $conn;
		}
		
		return $conn;
	}

	public  function getAttribute($attr) {
		return $this->dbh->getAttribute($attr);
	}

	public function prepare($sql) {
		return $this->dbh->prepare($sql);
	}
	
	public function execute($sql) {
		return $this->dbh->exec($sql);
	}
	
	public function prepareAndExecute($sql, $bind = array(), $log_query_flag = 0) {
		if (!is_array($bind)) {
			$bind = array($bind);
		}

		$start_time = microtime(true);
		try {
			if(!empty($bind)) {
				$stmt = $this->dbh->prepare($sql);
				$stmt->execute($bind);
				$result = $stmt->rowCount();
			}
			else {
				$result = $this->dbh->exec($sql);
			}
			$end_time = microtime(true);
			if($log_query_flag) {
				UserUtils::logIntoHistory($start_time, $end_time, $sql, "success");
			}

			return $result;
		}
		catch(Exception $e) {
			$end_time = microtime(true);
			if($log_query_flag) {
				UserUtils::logIntoHistory($start_time, $end_time, $sql, $e->getMessage());
			}
			Logger::error("Error while executing query [$sql]:  [" . $e->getMessage() . "]");
			throw $e;
		}
	}

	public function prepareAndQuery($sql, $bind = array(), $log_query_flag = 0) {
		
		if (!is_array($bind)) {
			$bind = array($bind);
		}
		$start_time = microtime(true);
		try {
			if(!empty($bind)) {
				$stmt = $this->dbh->prepare($sql);
				$stmt->execute($bind);
			}
			else {
				$stmt = $this->dbh->query($sql);
			}
			$end_time = microtime(true);
			if($log_query_flag) {
				UserUtils::logIntoHistory($start_time, $end_time, $sql, "success");
			}
		}
		catch(Exception $e) {
			$end_time = microtime(true);
			if($log_query_flag) {
				UserUtils::logIntoHistory($start_time, $end_time, $sql, $e->getMessage());
			}
			Logger::error("Error while executing query [$sql]:  ["  . $e->getMessage() . "]");
			throw $e;
		}
		return $stmt;
	}

	public function insertIgnore($table, $data, $log_query_flag = 0) {
		return $this->insert($table, $data, 1, $log_query_flag);
	}

	// Will return last increment id or 0 if insert is ignored
	public function insert($table, $data, $ignore_flag = 0, $log_query_flag = 0) {
		if(!$data) return;
		if(is_object($data)) $data  = (array)$data;
		$cols = array();
		$holders = array();
		foreach($data as $key => $value) {
			$cols[] = $key;
			if($value instanceof DBExpr) {
				$holders[] = $value->toString();
				unset($data[$key]);
			}
			else
			$holders[] = "?";
		}
		
		
		$ignore = ($ignore_flag)?"ignore":"";
		$sql = "insert $ignore into $table(";
		foreach($cols as $col) {
			$sql .= "`$col`,";
		}
		$sql = rtrim($sql, ",");
		$sql .= ") values (" . implode("," , $holders) . ")";
		$rowCount = $this->prepareAndExecute($sql, array_values($data), $log_query_flag);

		if($ignore_flag && $rowCount == 0) {
			return 0;
		}
		return $this->dbh->lastInsertId($table);
	}

	public function lastInsertId($table="") {
		return  $this->dbh->lastInsertId($table);
	}

	// Will return 1 if the row is inserted as a new row
	// and 2 if an existing row is updated.
	public function insertOrUpdate($table, $data, $log_query_flag = 0) {
		if(!$data) return;
		if(is_object($data)) $data  = (array)$data;

		$cols = array();
		$holders = array();
		foreach($data as $key => $value) {
			$cols[] = $key;
			if($value instanceof DBExpr) {
				$holders[] = $value->toString();
				unset($data[$key]);
			}
			else
			$holders[] = "?";
		}
		$updcols = array();
		foreach($data as $col => $value) {
			if($value instanceof DBExpr) {
				$updcols[] =  "$col = " . $value->toString();
				unset($data[$col]);
			}
			else
			$updcols[] =  "$col = ?";
		}

		$sql = "insert into $table(" . implode("," , $cols) . ")
        values (" . implode("," , $holders) . ") on duplicate key update " . implode("," , $updcols);

		return $this->prepareAndExecute($sql, array_merge(array_values($data) , array_values($data)), $log_query_flag);
	}

	// Will return the last increment id
	public function replace($table, $data, $log_query_flag = 0) {
		if(!$data) return;
		if(is_object($data)) $data  = (array)$data;

		$cols = array();
		$holders = array();
		foreach($data as $key => $value) {
			$cols[] = $key;
			if($value instanceof DBExpr) {
				$holders[] = $value->toString();
				unset($data[$key]);
			}
			else
			$holders[] = "?";
		}
		
		$sql = "replace into $table(";
		foreach($cols as $col) {
			$sql .= "`$col`,";
		}
		$sql = rtrim($sql, ",");
		$sql .= ") values (" . implode("," , $holders) . ")";
		$this->prepareAndExecute($sql, array_values($data), $log_query_flag);
		return $this->dbh->lastInsertId($table);
	}

	// Will return the number of affected rows
	public function update($table, $data, $where_cond, $where_data, $log_query_flag = 0) {
		if(!$data) return;
		if(is_object($data)) $data  = (array)$data;

		$values = array_values($data);
		$cols = array();
		foreach($data as $col => $value) {
			if($value instanceof DBExpr) {
				$cols[] =  "`$col` = " . $value->toString();
				unset($data[$col]);
			}
			else
			$cols[] =  "`$col` = ?";
		}
		$sql = "update $table set " . implode("," , $cols) . " " . $where_cond ;
		$bind =array_merge(array_values($data),(array)$where_data);
		return $this->prepareAndExecute($sql, $bind, $log_query_flag);
	}

	public function fetchRows($sql, $bind=array(), $count, $log_query_flag = 0) {
		$sql = rtrim(trim($sql), ";");
		if ($count) {
			if (stristr($sql, ' limit ')) {
				$sql = preg_replace('/ limit \d+,\s*?\d+\s*?$/', "" , $sql );
			}

			$sql .= " limit 0, $count";
		}

		return DB::fetchAll($sql, $bind, $log_query_flag);
	}

	public function fetchSingleRow($sql, $bind = array(), $log_query_flag = 0) {
		$stmt = $this->prepareAndQuery($sql, $bind, $log_query_flag);
		$result = $stmt->fetch(PDO::FETCH_OBJ);
		$stmt->closeCursor();
		return $result;
	}
	
	public function fetchSingleColumn($sql, $bind = array(), $log_query_flag = 0) {
		$stmt = $this->prepareAndQuery($sql, $bind, $log_query_flag);
		$result = $stmt->fetchColumn(0);
		$stmt->closeCursor();
		return $result;
	}

	public function fetchCol($sql, $bind = array(), $log_query_flag = 0) {
		$stmt = $this->prepareAndQuery($sql, $bind, $log_query_flag);
		return $stmt->fetchAll(PDO::FETCH_COLUMN, 0 );
	}

	public function fetchAll($sql, $bind = array(), $log_query_flag = 0) {
		$stmt = $this->prepareAndQuery($sql, $bind, $log_query_flag);
		return $stmt->fetchAll(PDO::FETCH_OBJ);
	}

	protected $hasActiveTransaction = false;

	public function beginTransaction () {
		if ( $this->hasActiveTransaction ) {
			return false;
		} else {
			Logger::info("Beginning the transaction");
			$this->hasActiveTransaction = $this->dbh->beginTransaction ();
			if(!$this->hasActiveTransaction) {
				throw new Exception("Could not begin the transaction");
			}
			return $this->hasActiveTransaction;
		}
	}

	public function commit () {
		if($this->hasActiveTransaction) $this->dbh->commit();
		$this->hasActiveTransaction = false;
	}

	public function rollback () {
		if($this->hasActiveTransaction) $this->dbh->rollback();
		$this->hasActiveTransaction = false;
	}

}

?>