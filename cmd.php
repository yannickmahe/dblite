<?php

include_once 'common.php';
Session::start();

if(!empty($_REQUEST['form'])) {
	$command =  $_REQUEST['command'];
	$server = new Server();
	$data = $server->executeCommand($command, $_REQUEST);
	print json_encode($data);
}
else {
	$obj = new stdClass();
	$obj->id =  $_REQUEST['id'];
	$obj->command =  $_REQUEST['command'];
	$obj->params = (array)json_decode($_REQUEST['params']);
	
	include_once 'Server.php';
	$server = new Server();
	$data = $server->executeCommand($obj->command, $obj->params);
	$response = new stdClass();
	$response->id = $obj->id;
	$data->history_data = isset($_REQUEST['history_data'])? $_REQUEST['history_data'] : '';
	$response->data = $data;
	print json_encode($response);
}

?>