<?php

if (preg_match('/localhost/', $_SERVER['HTTP_HOST']) ||
  	preg_match('/dblite.local/', $_SERVER['HTTP_HOST'])) {
    define('MAIN_URL', "http://" . $_SERVER['HTTP_HOST'] . "/");
}

// Setting the catch for fatal errors
ini_set('display_errors','0');
ini_set('error_prepend_string', '<fwphpfatalerror>');
ini_set('error_append_string', '</fwphpfatalerror>');
ob_start('fatal_error_handler');
//session_start();
function fatal_error_handler($output)
{
    if(preg_match('@<fwphpfatalerror>(.*)</fwphpfatalerror>@s', $output, $matches)) {
        $error = $matches[1];
        $response = new stdClass();
        $response->success = false;
        $response->msg = $error;
		return json_encode($response);
		// TODO handle the error
    }
    return $output;
}

// define commonly used path constants
$app_root = realpath(__FILE__);
$app_root = dirname($app_root);
$app_root = preg_replace('@\\\@', '/', $app_root);
define('APPROOT', $app_root);
// Paths to store all database files
define("DATABASE_DIR", APPROOT . "/data/database/");
define("USERS_DB_PATH", DATABASE_DIR . "users.sqlite");
define("USERS_DATA_DB_PATH", DATABASE_DIR . "users_data.sqlite");
define("GUEST_USERS_DB_PATH", DATABASE_DIR . "guest_users.sqlite");
define("EDITORS_ROOT", APPROOT . "/data/savedqueries" );
define("HISTORY_ROOT", APPROOT . "/data/history" );
define("GUEST_USERS_DATA_DB_PATH", DATABASE_DIR . "guest_users_data.sqlite");
define('APP_COOKIE', 'dblite_cookie');
define("LOGIN_COOKIE", "dblite_login");

//history logic vars
define("DELIMITER", ";");
define("READ_LIMIT", 100);

// db privilege information for testing
define('DB_HOST', "localhost");
define('DB_USER', "root");
define('DB_PASS', "");

//version
define("VERSION", '0.51');

// defining include path
$paths = array();
$paths[] = ".";
$paths[] = APPROOT;
$paths[] = APPROOT . "/app/lib";
$paths[] = APPROOT . "/app/commands";
$paths[] = APPROOT . "/app/lib/Mailer";
$paths[] = APPROOT . "/testers";
ini_set("include_path", implode(PATH_SEPARATOR, $paths));

if(!function_exists('__autoload')){
  function __autoload($class_name){
      if(!class_exists($class_name)){
          include_once "${class_name}.php";
      }
      if(!class_exists($class_name)){
      	$e = new Exception("$class_name not found");
      	throw $e;
      }
}
}

?>