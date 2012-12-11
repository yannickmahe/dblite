<?php
	$dev = true;
	if($dev) {
		$app_root = realpath(__FILE__);
		$app_root = dirname($app_root);
		$app_root = preg_replace('@\\\@', '/', $app_root);
		define('APPROOT', $app_root);
		$files = array_merge(glob(APPROOT . "/app/js/plugins/*.js"),
		glob(APPROOT . "/app/js/dblite/*.js"));
	} 

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf8">
<meta name="keywords" content="mysql client, database access tool, web based mysql client, mysql query browser, sqlbuddy, phpmyadmin, navicat, mysql query browser, sqlyog, MySQL interface management, Web based MySQL administration, Effective MySQL Management, mysql utilities, mysql management, database administration tool, Web based interface, SQL Editor, mysql management tool, MySQL GUI Tools, MySQL Administrator"/>
<title>DBLite: Web based MySQL client | mysql query browser | Web based MySQL administration</title>
    <script type="text/javascript" src="app/extjs/adapter/ext/ext-base.js"></script>
    <script type="text/javascript" src="app/extjs/ext-all<?php if($dev) echo "-debug"; ?>.js"></script>
    <script>
    	Dbl = {};
    	window.onbeforeunload = function() { return Editor.promptBeforeLeave(); };
    	if(!console) {
    		console = {
    				log: function(msg) {}
    		};
    	}
    	var MAIN_URL = window.location.href.replace(/\/+$/, '');
    </script>
    <script type="text/javascript"  src="app/codemirror/CodeMirror-0.7/js/codemirror.js"></script>
    <script type="text/javascript" src="app/codemirror/Ext.ux.panel.CodeMirror.js"></script>    
    <script src="app/js/codemirror/stringStream.js" type="text/javascript"></script>
	<script src="app/js/codemirror/tokenize.js" type="text/javascript"></script>        
    <script src="app/js/codemirror/highlight.js" type="text/javascript"></script>
	<script src="app/js/codemirror/parsesql1.js" type="text/javascript"></script>        
	<?php 
	if($dev) { 
		foreach($files as $file) { 
			$file = str_replace(APPROOT, '', $file);
			echo '<script type="text/javascript" src="' . $file . '"></script>' . "\n";
		}
	} 
	else { 
	    echo '<script type="text/javascript" src="app/js/dblite.combined.js"></script>';
    }
    ?>
    <link rel="stylesheet" type="text/css" href="app/extjs/resources/css/ext-all.css">
    <link rel="stylesheet" type="text/css" href="app/css/dblite.css">
    <link rel="stylesheet" type="text/css" href="app/css/fileuploadfield.css">
    <link rel="stylesheet" type="text/css" href="app/css/multiselect.css">
    <link rel="stylesheet" type="text/css" href="app/css/sqlcolors.css">
</head>
<body>
</body>
</html>
