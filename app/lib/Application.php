<?php

/*
class Application {
	public static $data = array();
	
	public static function loadSession() {
		// Load all the logged in user connections
		if(!empty(Session::$user)) {
			$user = Session::$user;
			$servers = UserUtils::getUserConnections();
			$connections = array();
			foreach($servers as $key => $server) {
				$connections['servers'][$server->connection_name] = $server;
			}
			self::$data = $connections;
		}
		// Load all the guest user connections if no user logged in
		else {
			$app_file = APPROOT . "/data/sessions/" . APP_ID;
			if(file_exists($app_file)) {
				$content = file_get_contents($app_file);
				self::$data = unserialize($content);
			}
		}
	}
	public static function saveSession() {
		$app_file = APPROOT . "/data/sessions/" . APP_ID;
		file_put_contents($app_file, serialize(self::$data));
	}
}
*/
?>