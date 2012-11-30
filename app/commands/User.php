<?php

class User {

	public function register_user($params) {
		// check for demo version
		$is_demo_version = Utils::checkForDemoVersion();
		if($is_demo_version) {
			throw new Exception("This feature is not available in demo version. <br /> Please <a href='http://dblite.com/download' target='_blank'>download</a> the full version or <a href='http://user.dblite.com' target='_blank'>register</a> with us.");
			return;
		}

		include_once("config.php");
		$guestSession = Session::read();
		$sessionId = session_id();

		$params = (object)$params;
		$output = UserUtils::validateRegisterForm($params);

		if($output->success) {
			try {
				UserUtils::saveUserData($params);
				$user = UserUtils::getUserByName(trim($params->username));
				Session::startUserSession($user);

				// Send the registration mail to the user
				DbliteMailer::sendRegistrationConfirmationEmail($user->user_name, $user->email_id);
				if($params->saveToAccount) {
					$servers = $guestSession["servers"];
					foreach($servers as $id => $obj) {
						$dbh = UserUtils::getUserDBConnection();
						$data = array(
							"user_id" => $user->user_id,
							"connection_name" => $id,
							"type" => $obj->type,
							"host" => $obj->host,
							"port" => $obj->port,
							"user" => $obj->user,
							"password" => $obj->password,
							"database"	=> $obj->database,
							"save_password" => 1
						);

						$dbh->insert("user_connections", $data);
					}
					$state = $guestSession["state"];
					foreach($state as $key => $value) {
						$activity = new stdClass();
						$activity->key = $key;
						$activity->value = $value;
						UserUtils::saveUserActivity($activity);
						if(($key == "editorTabList") && $value) {
							$source_dir = EDITORS_ROOT . "/" . $sessionId;
							$target_dir = EDITORS_ROOT . "/" . $user->user_name;
							Utils::copyDirectory($source_dir, $target_dir);
							Utils::recursiveDelete($source_dir);
						}
					}
				} else {
					$editors = $guestSession["state"]["editorTabList"];
					if($editors) {
						$source_dir = EDITORS_ROOT . "/" . $sessionId;
						Utils::recursiveDelete($source_dir);
					}
				}

				for($i=0; $i<count($config["connection"]); $i++) {
					$server = (object)$config["connection"][$i];
					$connection_name = $server->connection_name;
					if($servers->{$connection_name})
					continue;

					$dbh = UserUtils::getUserDBConnection();

					$data = array(
						"user_id" => $user->user_id,
						"connection_name" => $connection_name,
						"type" => $server->type,
						"host" => $server->host,
						"port" => $server->port,
						"user" => $server->user,
						"password" => $server->password,
						"save_password" => $server->save_password,
						"database" => $server->database
					);

					$dbh->insert("user_connections", $data);
				}
				$output->user = $user;
			}
			catch(Exception $e) {
				throw $e;
			}
		}
		return $output;
	}

	public function change_userdata($params) {
		// check for demo version
		$is_demo_version = Utils::checkForDemoVersion();
		if($is_demo_version) {
			throw new Exception("This feature is not available in demo version. <br /> Please <a href='http://dblite.com/download' target='_blank'>download</a> the full version or <a href='http://user.dblite.com' target='_blank'>register</a> with us.");
			return;
		}


		$params = (object)$params;
		$changes = array();
		$output = UserUtils::validateChangeForm($params);
		if($output->success) {
			$user = Session::$user;
			if($params->newpassword) {
				$user->password = sha1($params->newpassword);
				$changes[] = "Password";
			}
			if($params->newusername) {
				$user->user_name = $params->newusername;
				$changes[] = "Username: $params->newusername";
			}
			if($params->newemail) {
				$user->email_id = $params->newemail;
				$changes[] = "Email: $params->newemail";
			}
			try{
				UserUtils::updateProfileChanges($params);
				Session::updateUserSession($user);
				DbliteMailer::sendChangeNotificationEmail($user->user_name, $user->email_id, $changes);
			} catch(Exception $e) {
				throw $e;
			}
		}
		return $output;
	}

	public function login_user($params) {
		// check for demo version
		$is_demo_version = Utils::checkForDemoVersion();
		if($is_demo_version) {
			throw new Exception("This feature is not available in demo version. <br /> Please <a href='http://dblite.com/download' target='_blank'>download</a> the full version or <a href='http://user.dblite.com' target='_blank'>register</a> with us.");
			return;
		}


		$params = (object)$params;
		$output = UserUtils::validateLoginUser($params);
		if($output->success) {
			UserUtils::updateLastLoggedinTime($output->user->user_name);
			Session::startUserSession($output->user, $params->remember_me);
			UserUtils::clearUserHistory();
		}
		return $output;
	}

	public function continue_guest_user($params) {
		$directory  = EDITORS_ROOT . "/" . session_id();
		Utils::recursiveDelete($directory);

		$servers = Session::read("servers");
		if($params["guest_user"]) {
			Session::startUserSession($params["guest_user"]);
		}
		Session::write("servers", $servers);
	}

	public function logout_user($params) {
		$user = Session::$user;
		$directory = HISTORY_ROOT . "/" . $user->user_name;
		Utils::recursiveDelete($directory);
		Session::destroy();
	}

	public function reset_user_password($params) {
		// check for demo version
		$is_demo_version = Utils::checkForDemoVersion();
		if($is_demo_version) {
			throw new Exception("This feature is not available in demo version. <br /> Please <a href='http://dblite.com/download' target='_blank'>download</a> the full version or <a href='http://user.dblite.com' target='_blank'>register</a> with us.");
			return;
		}

		$output = new stdClass();
		if(!$params["reset_password"]) {
			$output->msg = "Please enter your email address.";
			$output->success = false;
			return $output;
		}
		$send_status = UserUtils::resetPassword($params["reset_password"]);
		$output->msg = $send_status->msg;
		$output->success = $send_status->success;
		return $output;
	}

	public function save_user_activity($params) {
		$output = new stdClass();
		$activity = (object)$params;
		$user = Session::$user;
		if(!$user) {
			$output->success = true;
			return $output;
		}
		$activity->user_id = $user->user_id;
		$updated = UserUtils::saveUserLastActivity($activity);
		if($updated) {
			$output->success = true;
		}
		return $output;
	}

	public function update_user_activity($params) {
		$output = new stdClass();
		$activity = (object)$params;
		$updated = UserUtils::saveUserActivity($activity);
		if($updated) {
			$output->success = true;
		}
		return $output;
	}

	public function update_user_activities($params) {
		$output = new stdClass();
		$output->success = true;
		for($i=0; $i<count($params); $i++) {
			$result = $this->update_user_activity($params[$i]);
			if(!$result->success)
			$output->success = false;
		}
		return $output;
	}

	public function get_queryfiles_content($params) {
		$output = new stdClass();
		$editors = json_decode($params["editors"]);
		$output->success = true;
		$user = Session::$user;

		if(!user || $user == "guest_user") {
			$sql_dir = EDITORS_ROOT . "/" . session_id();
		} else {
			$sql_dir = EDITORS_ROOT . "/" . $user->user_name;
		}


		if(count($editors)) {
			foreach($editors as $editor){
				$file_path = $editor->sqlfolder ? ($editor->sqlfolder . "/" . $editor->sqlfile) : $editor->sqlfile;
				$actual_path = $sql_dir . "/" . $file_path;
				$queries = Utils::getSavedQueries($actual_path);
				$editor->content = $queries;
			}
		}

		$output->editors = $editors;
		return $output;
	}

	public function retrieve_user_activity($params) {
		include_once("config.php");

		// check for demo version
		$is_demo_version = Utils::checkForDemoVersion();
		if($is_demo_version) {
			$guest = UserUtils::getGuestUser();
			UserUtils::updateLastLoggedinTime($guest->user_name);
			Session::startUserSession($guest, true);
			UserUtils::clearUserHistory();
			$user = Session::$user;
			$userObj = UserUtils::getUserActivity($guest->user_id);
			return (object)array_merge((array)$config["defaults"], (array)$userObj);
		}


		$user = Session::$user;

		if($user) {
			if($user == "guest_user") {
				$guestUser = (object)Session::read("state");
				if(!empty($guestUser->editorTabList)) {
					$guestUser->editorTabList = unserialize($guestUser->editorTabList);
				}
				//$guestUser = new stdClass();
				$guestUser->guestUser = array("guestUser" => "continue_guest_user");
				$userObj = $guestUser;
			} else {
				$userObj = UserUtils::getUserActivity($user->user_id);
			}
		}
		else {
			$userObj = Session::read("state");

			if(Session::read("servers") === null) {
				$servers = array();
				for($i=0; $i<count($config["connection"]); $i++) {
					$server = $config["connection"][$i];
					if($server["guest_access"])
						$servers[$server["connection_name"]] = (object)$server;
					UserUtils::$connections = null;
				}
				Session::write("servers", $servers);
			}
		}

		$returnObj = (object)array_merge((array)$config["defaults"], (array)$userObj);
		return $returnObj;

	}

	public function get_user_session_data($params) {
		$result = new stdClass();
		$user = Session::$user;
		if($user){
			$result->user = $user;
		}
		return $result;
	}

	public function destroy_session() {
		$directory = EDITORS_ROOT . "/" . session_id();
		Utils::recursiveDelete($directory);
		Session::destroy();
	}
}
?>
