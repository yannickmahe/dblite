<?php



class UserUtils {
	static $connections = array();
	static $conn;
	
	public static function getUserDBConnection() {
		include("config.php");
		if(!self::$conn) {
			//check for user version
			self::$conn = DB::getConnection($config['user_dsn']['type'],$config['user_dsn']); 
//			$is_user_version = Utils::checkForUserVersion();
//			if($is_user_version) {
//				$db_config = array(
//					"host" => $config['user_dsn']['host'],
//					"port" => $config['user_dsn']['port'],
//					"user" => $config['user_dsn']['user'],
//					"password" => $config['user_dsn']['password'],
//					"database" => $config['user_dsn']['database']
//				);
//				self::$conn = DB::getConnection($config['user_dsn']['type'], $db_config);
//			} else {
//				self::$conn = DB::getConnection($config['user_dsn']['type'], array("file" => $config['user_dsn']['path']));
//			}
		}
		return self::$conn;
	}

	// Get the user details by ID
	public static function getUserById($user_id="") {
		$dbh = self::getUserDBConnection();
		$sql = "select * from users where user_id = ?";
		$user = $dbh->fetchSingleRow($sql, array($user_id));
		return $user;
	}

	// Get the user details by NAME
	public static function getUserByName($user_name) {
		$dbh = self::getUserDBConnection();
		$sql = "select * from users where user_name = ?";
		return $dbh->fetchSingleRow($sql, array($user_name));
	}

	// Get the user details by EMAIL ID
	public static function getUserByEmail($email_id) {
		$dbh = self::getUserDBConnection();
		$sql = "select * from users where email_id = ?";
		return $dbh->fetchSingleRow($sql, array($email_id));
		return $user;
	}

	// Store new user details
	public static function saveUserData($user) {
		$dbh = self::getUserDBConnection();
		$password = sha1($user->password);

		$data = array(
			"user_name" => $user->username,
			"email_id" => $user->email,
			"password" => sha1($user->password),
			"last_logged_on" => date('Y-m-d H:i:s'), 
			"created_on" =>  date('Y-m-d H:i:s')
		);

		return $dbh->insert("users", $data);

		//		$sql = "INSERT INTO
		//		users (user_name, email_id, password, last_logged_on, created_on)
		//		VALUES('$user->username', '$user->email', '$password', DATETIME('NOW'), DATETIME('NOW'));";
		//		$dbh->execute("BEGIN; $sql	COMMIT;");
	}

	public static function getUserConnections() {
		$user = Session::$user;
		$connections = array();
		if(self::$connections == null) {
			if(empty($user->user_id)) {
				$connections = $_SESSION['servers'];
			}
			else {
				$dbh = self::getUserDBConnection();
				$sql = "select * from user_connections where user_id = ?";
				$rows = $dbh->fetchAll($sql, array($user->user_id));
				foreach($rows as $row) {
					$conn = new stdClass();
					$conn->user_id =  $row->user_id;
					$conn->connection_id =  $row->connection_id;
					$conn->connection_name =  $row->connection_name;
					$conn->type =  $row->type;
					$conn->host =  $row->host;
					$conn->port =  $row->port;
					$conn->user =  $row->user;
					$conn->password =  $row->password;
					$conn->save_password =  $row->save_password;
					$conn->database =  $row->database;
					
					$connections[$conn->connection_name] = $conn;
				}
			}
			self::$connections = $connections;
		}

		return self::$connections;
	}

	public static function getUserConnection($connection_name) {
		$connections = self::getUserConnections();
		return $connections[$connection_name];
	}

	// Save the user connection details
	public static function saveUserConnection($connection, $user_id="") {
		if(!$user_id) {
			$server = array (
				"connection_name" => $connection->saved_connection_id,
	       		"type" => $connection->connection_type,
	       		"host" => $connection->connection_host,
         		"port" => $connection->connection_port,
         		"name" => $connection->connection_database,
         		"user" => $connection->connection_user,
         		"password" => $connection->connection_password,
	       		"save_password" => $connection->save_password
			);

			$connections = Session::read("servers");
			$connections[$connection->saved_connection_id]	 = (object)$server;
			Session::write("servers", $connections);
		} else {
			$dbh = self::getUserDBConnection();
			$data = array(
				"user_id" => $user_id,
				"connection_name" => $connection->saved_connection_id,
				"type" => $connection->connection_type,
				"host" => $connection->connection_host,
				"port" => $connection->connection_port,
				"user" => $connection->connection_user,
				"password" => $connection->connection_password,
				"database" => $connection->connection_database,
				"save_password" => $connection->save_password
			);

		
			$dbh->insert("user_connections", $data);
		}
		self::$connections = null;
	}

	// Save the user connection details
	public static function updateUserConnection($connection, $user_id="") {
		$newConnectionId = $connection->saved_connection_id;
		$oldConnectionId = $connection->actual_connection_id;

		$server = array(
	    	"connection_name" => $connection->saved_connection_id,
      		"type" => $connection->connection_type,
      		"host" => $connection->connection_host,
      		"port" => $connection->connection_port,
      		"user" => $connection->connection_user,
      		"database" => $connection->connection_database,
	    	"save_password" => $connection->save_password
		);
		//    if(!($connection->connection_blankPassword == false && $connection->connection_password == ''))
		if(isset($connection->connection_password)) {
			$server["database_password"] = $connection->connection_password;
		}


		if(!$user_id) {
			$servers = Session::read("servers");
			//	    if($servers[$connection->actual_connection_id])
			//	    {
			//	      $servers[$connection->saved_connection_id] = $servers[$connection->actual_connection_id];
			//	      unset($servers[$connection->actual_connection_id]);
			//	    }

			if($newConnectionId != $oldConnectionId) {
				$servers[$newConnectionId] = $servers[$oldConnectionId];
				unset($servers[$oldConnectionId]);
			}


			$servers[$newConnectionId] = array_merge((array)$servers[$newConnectionId],$server);
			$servers[$newConnectionId] = (object)$servers[$newConnectionId];
			Session::write("servers", $servers);
		} else {
			$dbh = self::getUserDBConnection();
			//			$serverDataPair = array();
			//			foreach($server as $key => $value) {
			//				$serverDataPair[] = "$key = '$value'";
			//			}
			//
			//			$sql = "UPDATE user_connections
			//  		        SET ".implode(',',$serverDataPair)."
			//  		        where user_id = '$user_id' and connection_name='$oldConnectionId'";
			//
			//			$dbh->execute($sql);

			$dbh->update("user_connections", $server, "where user_id = ? and connection_name = ?", array($user_id, $oldConnectionId));
		}
		self::$connections = null;
	}

	// Delete the corresponding user connection details
	public static function deleteUserConnection($user_id, $connection_name = "") {
		if(!$connection_name)
		return false;

		if(!$user_id) {
			$servers = Session::read("servers");
			unset($servers[$connection_name]);
			Session::write("servers",$servers);
		} else {
			$dbh = self::getUserDBConnection();
			$sql = "delete from user_connections where user_id = ? and connection_name = ?";
			$dbh->prepareAndExecute($sql, array($user_id, $connection_name));
		}
		self::$connections = null;
	}

	// Get the last activity of corresponding user
//	public static function getUserLastActivity($user_id) {
//		$dbh = self::getUserDBConnection();
//		$sql = "select * from user_last_activity where user_id = ?";
//		return $dbh->fetchSingleRow($sql, array($user_id));
//	}

	// Save the last activity of logged in user
//	public static function saveUserLastActivity($user_activity) {
//		$user_activity->user_editors = serialize($user_activity->user_editors);
//		$dbh = self::getUserDBConnection();
//
//		$insert_sql = "REPLACE INTO user_last_activity
//		(user_id, connection, database, table_name, editors_list, active_tab) values
//		('$user_activity->user_id', '$user_activity->connection_id', '$user_activity->database', '$user_activity->table_name', '$user_activity->user_editors', '$user_activity->active_tab');";
//		return $dbh->execute($insert_sql);
//	}

	public static function saveUserActivity($activity) {
		// check for demo version
		$is_demo_version = Utils::checkForDemoVersion();
		if($is_demo_version) {
			// do not save guest user activity
			return true;
		}


		$user = Session::$user;
		if($activity->key == "editorTabList") {
			$activity->value = serialize($activity->value);
		}

		if(!$user || $user == "guest_user") {
			Session::write("state", $activity->value, $activity->key);
			return true;
		}

		$dbh = self::getUserDBConnection();
		$data = array(
			"user_id" => $user->user_id,
			"activity_key" => $activity->key,
			"activity_value" => $activity->value   		
		);

		if(!$dbh->replace("user_activity_state", $data)) {
			return false;
		}

		return true;
	}

	public static function getUserActivity($user_id) {

		if(!$user_id) {
			return (object)Session::read("state");
		}

		$user = Session::$user;
		$dbh = self::getUserDBConnection();
		$sql = "select * from user_activity_state where user_id = ?";
		$lastActivity = $dbh->fetchRows($sql, array($user_id), 100);
		$lastActivityObj = new stdClass();

		for($i=0; $i<count($lastActivity); $i++) {
			$curr = $lastActivity[$i];
			switch($curr->activity_key) {
				case "editorTabList":
					if(strlen($curr->activity_value))
					$curr->activity_value = json_decode(unserialize($curr->activity_value));
					break;
			}
			if($curr->activity_key) {
				$lastActivityObj->{$curr->activity_key} = $curr->activity_value;
			}
		}
		$lastActivityObj->user = array("user_name" => $user->user_name, "email_id" => $user->email_id);

		return $lastActivityObj;
	}

	// function to validate register form
	public static function validateRegisterForm($params) {
		$username = trim($params->username);
		$password = trim($params->password);
		$confpass = trim($params->confpass);
		$email    = trim($params->email);

		$output = new stdClass();
		$output->success = true;

		//$db = new SQLiteDatabase(USERS_DB_PATH);
		$dbh = self::getUserDBConnection();

		if(!$username || !$password || !$confpass || !$email) {
			$output->success = false;
			$output->msg = "Form fields could not be submitted with empty values";
		} elseif(!preg_match('/^[a-zA-Z0-9]*$/i', $username)) {
			$output->success = false;
			$output->msg = "Username is not valid";
		} elseif(trim($password) != trim($confpass)) {
			$output->success = false;
			$output->msg = "Passwords do not match";
		} elseif(!preg_match('/^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z.]{2,5}$/i', $email)) {
			$output->success = false;
			$output->msg = "Email is not valid";
		} elseif($dbh->fetchSingleColumn("select user_id from users where user_name = ?", array($username))) {
			$output->success = false;
			$output->msg = "Username already exists";
		} elseif($dbh->fetchSingleColumn("select user_id from users where email_id = ?", array($email))) {
			$output->success = false;
			$output->msg = "Email already exists";
		}

		return $output;
	}


	// function to validate user while logging in
	public static function validateLoginUser($params) {
		$username = trim($params->username);
		$password = trim($params->password);
		$user = UserUtils::getUserByName($username);

		$output = new stdClass();
		$output->success = true;
		$output->user = $user;

		if(!$username || !$password) {
			$output->success = false;
			$output->msg = "Form fields could not be submitted with empty values";
		}
		elseif($user->password != sha1($password)) {
			$output->success = false;
			$output->msg = "Incorrect username and/or password";
		}

		return $output;
	}

	// function to validate changes profile form like change email, username or password
	public static function validateChangeForm($params) {
		$output = new stdClass();
		$output->success = true;
		$dbh = self::getUserDBConnection();

		$user = Session::$user;
		$oldPassword = $dbh->fetchSingleColumn("select password from users where user_id = ?", array($user->user_id));


		if(sha1($params->oldPassword) != $oldPassword)
		{
			$output->success = false;
			$output->msg = "Incorrect current password";
			return $output;
		}

		if($params->newemail || $params->confnewemail) {
			if(!preg_match('/^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z.]{2,5}$/i', $params->newemail)) {
				$output->success = false;
				$output->msg = "Email is not valid";
				return $output;
			}
			if($dbh->fetchSingleColumn("select user_id from users where email_id = ?", array($params->newemail))) {
				$output->success = false;
				$output->msg = "Email already exists";
				return $output;
			}
		}
		/*
		 if($params->newusername || $params->confnewusername) {
			$new = trim($params->newusername);
			//	  	$confnew = trim($params->confnewusername);
			$changeItem = "Username";
			if(!preg_match('/^[a-zA-Z0-9]*$/i', $params->newusername)) {
			$output->success = false;
			$output->msg = "Username is not valid";
			return $output;
			}
			if($dbh->fetchSingleColumn("select user_id from users where user_name = '$params->newusername'")) {
			$output->success = false;
			$output->msg = "Username already exists";
			return $output;
			}
			}
			*/

		if($params->newemail != $params->confnewemail) {
			$output->success = false;
			$output->msg = "Emails do not match.";
			return $output;
		}
		if($params->newpassword != $params->confnewpass) {
			$output->success = false;
			$output->msg = "Passwords do not match.";
		}
		return $output;
	}

	// function to update user last loggedin time
	public static function updateLastLoggedinTime($username) {
		$dbh = self::getUserDBConnection();
		$dbh->prepareAndExecute("update users set last_logged_on = ? where user_name = ?", array(date('Y-m-d H:i:s'), $username));
	}

	//reset user password
	public static function resetPassword($email_id) {
		$output = new stdClass();
		$user_details = self::getUserByEmail($email_id);
		if(!$user_details->user_id) {
			$output->msg = "Email address does not exists.";
			$output->success = false;
			return $output;
		}
		$new_password = $user_details->user_id. strrev(substr(md5($user_details->email_id), 0, 4)). rand(100, 999);
		$crypted_password = sha1($new_password);

		if(DBliteMailer::SendResestPasswordEmail($user_details->user_name, $email_id, $new_password)) {
			$output->success = true;
			$dbh = self::getUserDBConnection();
			$dbh->update("users", array("password" => $crypted_password), "where user_id = ?", array($user_details->user_id));
			$output->msg = "Password has been reset successfully. Please check your email address.";
		}
		else {
			$output->msg = "Password could not be reset now. Please try later!";
			$output->success = false;
		}

		return $output;
	}

	// update Profile changes as username, email and password to database
	public static function updateProfilechanges($params) {
		$dbh = self::getUserDBConnection();
		$user = Session::$user;
		if($params->newpassword) {
			$crypted_password = sha1($params->newpassword);
			$dbh->update("users", array("password" => $crypted_password), "where user_id = ?", array($user->user_id));
			//$dbh->execute("UPDATE users SET password = '$crypted_password' WHERE user_id = '$user->user_id'");
			return true;
		} elseif($params->newemail) {
			$dbh->update("users", array("email_id" => $params->newemail), "where user_id = ?", array($user->user_id));
			//$dbh->execute("UPDATE users SET email_id = '$params->newemail' WHERE user_id = '$user->user_id'");
			return true;
		} elseif($params->newusername) {
			$dbh->update("users", array("user_name" => $params->newusername), "where user_id = ?", array($user->user_id));
			//$dbh->execute("UPDATE users SET user_name = '$params->newusername' WHERE user_id = '$user->user_id'");
			return true;
		}
	}

	public static function logIntoHistory($start_time, $end_time, $sql, $status) {
		$database = isset($_REQUEST["database"])?$_REQUEST["database"]:"";

		$user_name = (Session::$user)? Session::$user->user_name : session_id();
		$user_file = HISTORY_ROOT . "/$user_name";
		$date_time = date("Y-m-d H:i:s");
		$time_taken = $end_time - $start_time;
		$time_taken = round(($time_taken)/1000, 3);
		$time_taken = ($time_taken > 1)? $time_taken . " s" : $time_taken . " ms";

		$search       = array("\x00", "\x0a", "\x0d", "\x1a"); //\x08\\x09, not required
		$replace      = array('\0', '\n', '\r', '\Z');
		$sql = str_replace($search, $replace, $sql);
		$status = str_replace($search, $replace, $status);

		$_REQUEST["history_data"] = array($date_time, $time_taken, $sql, $database, $status);

		$insert_string = "\r\n" . $date_time . " | " . $time_taken . " | " . $sql . " | " . $database . " | " . $status;
		file_put_contents($user_file, $insert_string, FILE_APPEND);
	}

	public static function clearUserHistory() {
		$user_name = Session::$user->user_name;
		$user_file = HISTORY_ROOT . "/$user_name";

		$file_array = @file($user_file);
		$reversed_file_array = array_reverse($file_array);

		$new_file_datas = array();
		for($i=0; $i<=READ_LIMIT; $i++) {
			if(strlen(trim($reversed_file_array[$i])) > 0) {
				$new_file_datas[] = $reversed_file_array[$i];
			}
		}
		$new_file_array = implode("\r\n", array_reverse($new_file_datas));
		file_put_contents($user_file, $new_file_array);
	}

	public function saveUserFeedback($user_id, $category, $message, $email, $file) {
		$dbh = self::getUserDBConnection();
		$data = array ("user_id" => $user_id,
		 			   "feedback_category" => $category,
					   "feedback_message" => $message,
					   "user_email" => $email,
					   "file" => $file);
		return $dbh->insert("feedback", $data);
	}

	public function getUserFeedback($user_id = "") {
		$dbh = self::getUserDBConnection();
		$sql = "select * from feedback";
		$params = array();

		if($user_id) {
			$sql .= " where user_id = ?";
			$params[] = $user_id;
		}
		return $dbh->fetchAll($sql, $params);
	}

	public function deleteFeedback($feedback_id) {
		$dbh = self::getUserDBConnection();
		$sql = "delete from feedback where feedback_id = ?";
		return $dbh->execute($sql, array($feedback_id));
	}

	public function getGuestUser() {
		$dbh = self::getUserDBConnection();
		$sql = "select * from users where user_id = ?";
		return $dbh->fetchSingleRow($sql, array(1));
	}

}
?>
