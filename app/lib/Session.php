<?php

class Session {

	public static $user = "";
	public static $user_id = "";

	public static function start() {
		session_start();
		if(!empty($_SESSION['user'])) {
			Session::$user = $_SESSION['user'];
			Session::$user_id = isset(Session::$user->user_id)?Session::$user->user_id:0;
		}
		else {
			Session::checkUserCookie();
		}
		session_write_close();
	}

	public static function checkUserCookie() {
		if (!empty($_COOKIE[LOGIN_COOKIE])) {
			$session_key = $_COOKIE[LOGIN_COOKIE];
			$session_hash = substr($session_key, 0, 40);
			$user_id = str_replace($session_hash, '', $session_key);
			$user = UserUtils::getUserById($user_id);
				
			if ($session_hash != sha1($user->user_id . substr($user->password, 0, 16))) {
				return;
			}
			Session::startUserSession($user, true);
		}
	}

	public static function startUserSession($user, $remember_me=false) {
		Session::destroy();
		$session_id = sha1($user->user_id . substr($user->password, 0, 16)) . $user->user_id;
		session_id($session_id);
		session_start();
		$_SESSION['user'] = $user;
		session_write_close();
		Session::$user = $user;
		Session::$user_id = $user_id;
		if($remember_me) {
			Session::setUserCookie($user);
		}
	}
	public static function updateUserSession($user) {
		session_start();
		$_SESSION['user'] = $user;
		session_write_close();
		Session::$user = $user;
		Session::$user_id = $user_id;
	}

	private static function setUserCookie($user) {
		$user_cookie = self::generateUserCookie($user);
		$time = time () + 24 * 60 * 60 * 90;
		setcookie(LOGIN_COOKIE, $user_cookie, $time, "/");
	}

	private static function generateUserCookie($user) {
		$cookie_value = sha1($user->user_id . substr($user->password, 0, 16)) . $user->user_id;
		return $cookie_value;
	}

	public static function destroy() {
		session_start();
		$_SESSION = array();
		if (isset($_COOKIE[session_name()])) {
			setcookie(session_name(), '', time() - 24*60*60, '/');
		}
		if(isset($_COOKIE[LOGIN_COOKIE])) {
			setcookie(LOGIN_COOKIE, '', time() - 24*60*60, '/');
		}

		session_destroy();
		Session::$user = "";
		Session::$user_id = "";
	}

	public static function read($name="") {
		if(empty($name))
		{
			return $_SESSION;
		}

		return isset($_SESSION[$name])?$_SESSION[$name]:null;
	}

	public static function write($name, $value, $sub="") {
		session_start();
		if($sub) {
			$_SESSION[$name][$sub] = $value;
		}
		else {
			$_SESSION[$name] = $value;
		}
		session_write_close();
	}

	public static function delete($name) {
		unset($_SESSION[$name]);
	}

	public static function generateSessionId () {
		$sessid = '';
		$bag = "abcdefghijklmnopqrstuvwxyz0123456789";
		for ($i=0; $i<12; $i++) {
			$sessid .= substr($bag, rand(0, strlen($bag)-1), 1);
		}
		return $sessid;
	}
}
?>