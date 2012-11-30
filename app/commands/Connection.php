<?php

class Connection {

	public function get_connections($params) {
		$servers = array();
		$servers = UserUtils::getUserConnections();
		
		$output = array();
		foreach($servers as  $data) {
			$database = isset($data->database)?$data->database:"";
			$output[] = array($data->connection_name, $data->type,  $data->host, $data->user, $database, $data->port, $data->password, $data->save_password);
		}
		if(isset($params['add_new'])) {
			$output[] = array('New', '',  '', '', '', '', '');
		}
		return $output;
	}

	public function should_prompt_password($params) {
		$output = new stdClass();
		$output->success = true;
		$output->shouldPrompt = true;
		$connection_id = $params['newConnectionId'];
		$connection = UserUtils::getUserConnection($connection_id);

		if($connection->save_password) {
			$output->shouldPrompt = false;
		}
		else {
			$passwords = Session::read('passwords');
			if(isset($passwords[$connection_id])) {
				$output->shouldPrompt = false;
			}
		}
		return $output;
	}

	public function temp_save_password($params) {
		$output = new stdClass();
		Session::write('passwords', $params['password'], $params['newConnectionId']);

		$output->success = true;
		return $output;
	}

	public function test_server_connection($params) {
		$type = trim($params['type']);
		$host = trim($params['host']);
		$port = trim($params['port']);
		$user = trim($params['user']);
		$password = trim($params['password']);
		$database = trim($params['database']);
		$output = new stdClass();
		
		if(!$type || !$host || !$port || !$user) {
			$output->success = false;
			$output->msg = "Form fields could not be submitted with empty values";
			return $output;
		}

		if($port) {
			$port = ";port=" . $port;
		}
		$dbh = new PDO('mysql:host=' . $host . ';dbname=' . $database . $port, $user, $password, array());
		$output->success = true;
		return $output;
	}

	public function add_edit_server_connection($params) {
		$user = Session::$user;
		$output = new stdClass();
		$output->success = true;
		$params = (object)$params;
		
		if(!$params->saved_connection_id || !$params->connection_user || !$params->connection_type
		|| !$params->connection_host || !$params->connection_port) {
			$output->success = false;
			$output->msg = "Form fields could not be submitted with empty values";
			return $output;
		}


		// check for demo version
		$is_demo_version = Utils::checkForDemoVersion();
		if($is_demo_version) {
			throw new Exception("This feature is not available in demo version. <br /> Please <a href='http://dblite.com/download' target='_blank'>download</a> the full version or <a href='http://user.dblite.com' target='_blank'>register</a> with us.");
			$output->success = false;
			return;
		}

		// old => actual
		// new => saved
		// Find out if the requset is for editing or adding a new connection.
		$old = UserUtils::getUserConnection($params->actual_connection_id);
		$new = UserUtils::getUserConnection($params->saved_connection_id);
		if(!$old && !$new) {
			// The request is to create a new connection (store new)
			UserUtils::saveUserConnection($params, ($user->user_id ? $user->user_id : null));
			$output->msg = "Connection '$params->saved_connection_id' saved successfully.";
		} 
		elseif(($old && $new && $old->connection_name != $new->connection_name) || (!$old && $new)) {
			// The request is to update but the new connection name already exists
			// report error
			throw new Exception("Connection with name '$new->connection_name' already exists.");
		}
		else {
			// The request is to update the connection. (replace old with new)
			UserUtils::updateUserConnection($params, $user->user_id);
			$output->msg = "Connection '$params->saved_connection_id' Updated successfully.";
		}

		return $output;
	}

	public function delete_server_connection($params) {
		$connection_id = $params['connection_id'];
		$user = Session::read('user');
		$output = new stdClass();
		$output->success = true;

		// check for demo version
		$is_demo_version = Utils::checkForDemoVersion();
		if($is_demo_version) {
			throw new Exception("This feature is not available in demo version. <br /> Please <a href='http://dblite.com/download' target='_blank'>download</a> the full version or <a href='http://user.dblite.com' target='_blank'>register</a> with us.");
			$output->success = false;
			return;
		}


		$connection = UserUtils::getUserConnection($connection_id);
		if(!$connection->connection_name) {
			throw new Exception("No such connection exists!");
		}
		else {
			UserUtils::deleteUserConnection($user->user_id, $connection_id);
			$output->msg = "Connection deleted successfully";
		}
		return $output;
	}

	public function get_database_list($params) {
		$params['database'] = "";
		$connection = UserUtils::getUserConnection($params['connection_name']);
		
		if($connection) {
			$params['host'] = $connection->host;
			$params['port'] = $connection->port;
			$params['user'] = $connection->user;
			if($connection->save_password) {
				$params['password'] = $connection->password;
			}
		}
		try {
			$dbh = DB::getConnection(DB::TYPE_MYSQL, $params);
			$database_list = $dbh->fetchCol("show databases", array(), 1);
		}
		catch(Exception $ex) {
			Logger::info($ex);
		}
		return $database_list;
	}
}

?>
