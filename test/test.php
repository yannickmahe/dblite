<?php

// If you're going to use this unit testing environment, do it in a better way
// that is not publically available on gdgt proper.
//header('Location: http://gdgt.com');
//exit;

include_once './common.php';

require_once('simpletest/web_tester.php');

$tester = $_REQUEST['tester'];
session_start();

$paths = array();
$paths[] = ini_get("include_path");
$paths[] = APPROOT . "/testers";
$paths[] = APPROOT . "/testers/actions";
$paths[] = APPROOT . "/testers/lib";
$paths[] = APPROOT . "/lib/phpunit";
ini_set("include_path", implode(PATH_SEPARATOR, $paths));

$tester_root = APPROOT . "/testers";
$testers = Utils::globr("$tester_root", "*Tester.php");

foreach($testers as $tester1) {
  $tester2 = preg_replace("/.*?(\w+?)Tester.php/", "$1", $tester1);
  if(strtolower($tester) == strtolower($tester2)){
      $class = $tester1;
      break;
    }
}

if(!$class) {
  die("Tester [$tester] not found");
}

try {
  if(1) {
  	Logger::info($class);
    $gTestLabel = basename($class, ".php");
    require_once('simpletest/autorun.php');
    include_once($class);
    Logger::info("here");
  }
  else {
    $tmpfile = tempnam(sys_get_temp_dir(), "PUNIT");
      if(!$tmpfile) {
         throw new Exception("Could not create temp file", Error::FILE_URL_TMPFILE_CREATION_ERROR);
      }
    $arguments = array(
      'test' => $gTestLabel,
      'testFile' => $class,
      'syntaxCheck' => true,
      'storyHTMLFile' => $tmpfile
    );
    require_once 'PHPUnit/TextUI/TestRunner.php';
    $runner = new PHPUnit_TextUI_TestRunner();
    $suite = $runner->getTest($gTestLabel, $class, true);
    
  //  $suite = new PHPUnit_Framework_TestSuite();
  //  $suite->addTest(new $gTestLabel);
  //  Logger::info($suite);
    $result = $runner->doRun($suite, $arguments);
    print file_get_contents($tmpfile);
  }
}
catch(Exception $e) {
  Logger::info("Caught exception");
  Logger::exception($e);
  $message = Utils::getExceptionAsString($e, $obj);
  Logger::error($message);
    ViewManager::renderException($e, $obj);
}
?>