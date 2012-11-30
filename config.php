<?php

$config['version']  = "_VERSION_";

$config['defaults']['explorerWidth'] = 250;
$config['defaults']['explorerMinWidth'] = 200;
$config['defaults']['datapanelHeight'] = 200;
$config['defaults']['datapanelMinHeight'] = 200;
$config['defaults']['datapanelActiveTab'] = 0;
$config['defaults']['activeConnTab'] = 0;
$config['defaults']['activeDbTab'] = 0;
$config['defaults']['activeTableTab'] = 0;
//$config['defaults']['connection'] = 'Localhost';

//default db config for sqlite
$config['user_dsn']['type'] = DB::TYPE_SQLITE;
$config['user_dsn']['file'] = USERS_DB_PATH;

// configs for demo version
$config['demo_version_flag'] = true;

$config['connection'][0]['connection_name'] = 'localhost';
$config['connection'][0]['host'] = '127.0.0.1';
$config['connection'][0]['type'] = 'mysql';
$config['connection'][0]['port'] = '3306';
$config['connection'][0]['user'] = 'root';
$config['connection'][0]['password'] = '';
$config['connection'][0]['save_password'] = true;
$config['connection'][0]['database'] = '';
$config['connection'][0]['guest_access'] = true;


?>
