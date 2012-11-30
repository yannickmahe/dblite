<?php

$app_root = realpath(__FILE__);
$app_root = dirname($app_root);
$app_root = dirname($app_root);
$app_root = preg_replace('@\\\@', '/', $app_root);
define('APPROOT', $app_root);

compile_with_yui();
//compile_with_closure();

function compile_with_yui($include_extjs=false) {
	global $files;
	$command = "java -jar " . APPROOT . "/tools/yuicompressor.jar ";
	$outFile = APPROOT . "/js/dblite.combined.js";
	$command  .= " -o $outFile ";
	$tmpFile = APPROOT . "/js/dblite.combined1.js";
	combineJsFiles($tmpFile);
	$command .= " $tmpFile";
	$command  .= " 2>&1";
	passthru1($command);
}
function compile_with_closure() {
	$command = "java -jar " . APPROOT . "/tools/compiler.jar ";
	$command .= "--compilation_level ADVANCED_OPTIMIZATIONS ";
	$tmpFile = APPROOT . "/js/dblite.combined1.js";
	combineJsFiles($tmpFile);
	$outFile = APPROOT . "/js/dblite.combined.js";
	$command .= "--js=$tmpFile --js_output_file=$outFile  2>&1 " ;
	passthru1($command);
}

function combineJsFiles($outputfile="", $include_extjs=false) {
	ob_start();
	if($include_extjs) {
		printJsFile(APPROOT . "/extjs/js/ext-base.js");
		printJsFile(APPROOT . "/extjs/js/ext-all-debug.js");
	}
	
	$files = array_merge(glob(APPROOT . "/js/plugins/*.js"),
						glob(APPROOT . "/js/dblite/*.js")); 
	foreach($files as $file) {
		printJsFile($file);
	}
    if ($outputfile) {
      file_put_contents($outputfile, ob_get_clean());
    } else {
      ob_end_flush();
    }
 }
 
function printJsFile($jsfile) {
    print "/*==============[$jsfile] START =============*/\n";
    print file_get_contents($jsfile);
    print "\n/*==============[$jsfile] END =============*/\n";
  }
  function passthru1($command) {
	print $command;
	print "<pre>";
	passthru($command, $ret);
	if ($ret !== 0) {
		throw new Exception("Failed to run command [" . $command . "]");
	}
}

?>
