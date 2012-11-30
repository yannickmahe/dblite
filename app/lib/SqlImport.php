<?php

// Unicode BOM is U+FEFF, but after encoded, it will look like this.
define ('UTF16_BIG_ENDIAN_BOM'   , chr(0xFE) . chr(0xFF));
define ('UTF16_LITTLE_ENDIAN_BOM', chr(0xFF) . chr(0xFE));
define ('UTF8_BOM'               , chr(0xEF) . chr(0xBB) . chr(0xBF));
define('BUFFER_SIZE', 32768);

class SqlImport {

	private $conn_id		= '';
	public $driver 			= '';
	private $file 		= '';
	public $processed		= '';
	public $flag			= 1;

	public function __construct($conn_id, $file) {
		$this->conn_id			= $conn_id;
		$this->file			= $file;
		$this->delimiter = DELIMITER;
	}

	public function remove_utf_characters($text) {
		$first2 = substr($text, 0, 2);
		$first3 = substr($text, 0, 3);
		if ($first3 == UTF8_BOM) return substr($text, 3);
		elseif ($first2 == UTF16_BIG_ENDIAN_BOM) return substr($text, 2);
		elseif ($first2 == UTF16_LITTLE_ENDIAN_BOM) return substr($text, 2);
	}

	public function setDbConn() {
//		$server_con = Application::$data['servers'][$this->conn_id];
//		$dbhost = $server_con->host;
//		$dbuser = $server_con->user;
//		$dbpass = $server_con->password;
		$this->driver = new MysqlDriver();
	}

	public function importData() {

		$fh = @fopen($this->file, 'r');
		$buffer = '';
		$open_str = "";
		$line_number = 0;

		while(!feof($fh)) {
			$line = fgets($fh, BUFFER_SIZE);
			//$line = rtrim($line, "\r\n");
//			$line = str_replace("\r\n", " ", $line);
//			$line = str_replace("\r", " ", $line);
//			$line = str_replace("\n", " ", $line);
			
			if(empty($line)) continue;
			$len = strlen($line);
			if(!$line_number) {
				$this->remove_utf_characters($line);
			}
			$line_number++;
			// If end of the line then add the current line to buffer and execute it.
			if(feof($fh)) {
				$buffer .= $line;
				break;
			}
			$offset = 0;
			//Logger::info("$line_number:$line:$len");
			$j = 0;
			while($offset <= $len) {
				preg_match('/(\'|"|#|--|\/\*|\*\/|`|DELIMITER)/', $line, $matches, PREG_OFFSET_CAPTURE, $offset);
				if($matches) {
					$match = $matches[1][0];
					$offset1 = $matches[1][1];
					//Logger::info("Found match [$match] at offset [$offset1]");
				}
				else {
					$offset1 = 2234234332;
				}
				$pos1 = strpos($line, $this->delimiter, $offset);
				if($pos1 !== false && $pos1 < $offset1) {
					//Logger::info("Found delimitor at [$pos1]");
					$buffer .= substr($line, $offset, $pos1 + strlen($this->delimiter) - $offset);
					$offset = $pos1 + strlen($this->delimiter);
					//Logger::info("New offset:" . $offset);
					if(!$open_str) {
						$this->executeQuery($buffer, $line_number);
						$buffer = "";
					}
					continue;
				}
				if(!$matches) {
					$buffer .= substr($line, $offset);
					$offset = 2234234332;
					continue;
				}
				if($open_str) {
					if($open_str == "/*" && $match == "*/") {
						$open_str = "";
					}
					else if($match == $open_str) {
						// check if $match is escaped
						$prev = $offset -1;
						while($line[$prev] == '\\') $prev--;
						//Logger::info("Match found");
						if(($offset - $prev -1)%2 == 0) { 
							$open_str = "";
						}
						//Logger::info("Match found : $open_str");
					}
				}
				else if($match == "'" || $match == '"' || $match == "`" || $match == "/*") {
					$open_str = $match;
				}
				else if($match == "--" || $match == "#") {
					$buffer .= substr($line, $offset, $offset1 - $offset);
					//Logger::info("Final buffer: " . $buffer);
					$offset = 234234324;
					continue;
				}
				else if($match == "DELIMITER") {
					if($buffer) {
						$this->executeQuery($buffer, $line_number);
						$buffer = "";
					}
//					$sql = substr($line, $offset);
//					$this->executeQuery($sql, $line_number);
//					$buffer .= substr($line, $offset);
					//$this->executeQuery($buffer, $line_number);
					$this->delimiter = trim(substr($line, $offset1 + strlen($match)));
					$offset = 234234324;
					//Logger::info("Final buffer: " . $buffer);
					continue;
				}
				//Logger::info("$line:$len:$offset1:$offset:$match:" . strlen($match));
				$buffer .= substr($line, $offset, $offset1 + strlen($match) - $offset);
				//Logger::info("Final buffer: " . $buffer);
				$offset = $offset1 + strlen($match);
			}
		}
		$this->executeQuery($buffer, $line_number);
		fclose($fh);

	}

	public function executeQuery($sql, $line_number) {
		$sql = trim($sql);
		$sql = rtrim($sql, $this->delimiter);
		if(empty($sql)) return;
		Logger::info("$line_number::$sql");
		$flag = true;
		$msg = "";
		$dbh = DB::getConnection();
		try {
			$dbh->prepareAndExecute($sql);
		}
		catch(Exception $e) {
			$flag = false;
			$msg = $e->getMessage();
		}
		if(!$flag) {
			throw new Exception("Error: [$msg] at line [$line_number] ");
		}
//		$this->processed = $this->driver->import_db($sql);
//		if(!$this->processed->success) {
//			$this->flag = 0;
//			$this->line_number = $line_number;
//		}
	}
}

?>