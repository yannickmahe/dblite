<?php

class Logger {

    private static $error_level = ErrorLevel::INFO;

    public function setErrorLevel($error_level) {
        self::$error_level = $error_level;
    }

    public function getErrorLevel() {
        return self::$error_level;
    }

    public function debug($msg) {
        if(self::$error_level <= ErrorLevel::DEBUG) {
            self::log1("DEBUG", $msg);
        }  
    }
    
    public function error($msg) {
        if(self::$error_level <= ErrorLevel::ERROR) {
            self::log1("ERROR", $msg);
        } 
    }
    
    public function warn($msg) {
        if(self::$error_level <= ErrorLevel::WARN) {
            self::log1("WARN", $msg);
        }
    }
    
    public function info($msg) {
        if(self::$error_level <= ErrorLevel::INFO) {
            self::log1("INFO", $msg);
        }
    }

    private function log1($level){
    	
        $arr = debug_backtrace();
        array_shift($arr);
        $record1 = array_shift($arr);
        $file   = $record1['file'];
        $line   = $record1['line'];
        $args   = $record1['args'];

        $msg = "";
        foreach($args as $arg) {
	        if(is_array($arg) || is_object($arg)){			
		        $msg .= "\n" . print_r($arg, true);
	        }
	        else {
		        $msg .= $arg;
	        }
        }
        error_log("$level:$file:$line:$msg");
    }
    public function exception($e){

        $file = $e->getFile();
        $line = $e->getLine();
        $msg  = $e->getMessage();
        $trace = "---------------------\n";
        $trace .= "Stack Trace:\n" . $e->getTraceAsString(). "\n";
        $trace .= "---------------------\n";
        error_log("EXCEPTION:$file:$line:$msg\n$trace");
    }
}

class ErrorLevel {
    const DEBUG = 0;
    const INFO  = 1;
    const WARN  = 2;
    const ERROR = 3;
}

?>