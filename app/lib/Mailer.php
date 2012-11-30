<?php

include_once "class.phpmailer.php";

class Mailer extends PHPMailer {
    public function AddAddresses($email_ids) {
        $email_ids = preg_split('/[\s,]+/', $email_ids);
        foreach ($email_ids as $email_id) {
            $this->AddAddress( $email_id );
        }
    }

    public static function sendMail($email_ids, $subject, $body) {
    	
    	if(ENVIRONMENT == Environment::LOCAL) return false;
    	
        $mail = new Mailer();
        $mail->IsSMTP();                    // send via SMTP
        $mail->Host = "localhost";          // SMTP servers
        $mail->SMTPAuth = true;             // turn on SMTP authentication
        $mail->Username = "";               // SMTP username
        $mail->Password = "";               // SMTP password

        $mail->From = "support@" . APPNAME . ".com";
        $mail->FromName = APPNAME . " Error";

        $email_ids = preg_split('/[\s,]+/', $email_ids);

        foreach ($email_ids as $email_id) {
            $mail->AddAddress( $email_id );
        }

        //$mail->WordWrap = 50;   // set word wrap
        $mail->IsHTML(false);
        $mail->Subject = $subject;
        $mail->Body = $body;

        if (!$mail->send()) {
            Logger::error("Mailer Error: " . $mail->ErrorInfo);
            return false;
        }

        return true;
    }

    // Send a mail regaring the error/exception
    public static function sendErrorMail($error, $exception_flag=false) {
    	$env = defined('ENVIRONMENT') ? ENVIRONMENT : "";
		
    	// Create the message to send as error mail body
    	$message = Mailer::getErrorMailBody($error, $exception_flag);

		// Send the mail and show the status message if the mail sending fails 
        $sent_status = Mailer::sendMail(ADMIN_EMAILS, APPNAME . " $env app error", $message);
        if ($exception_flag) {
			return array($message, $sent_status);
		}

        if (!$sent_status) {
            Logger::error("Failed to send error email");
        }
    }
    

    // Arrange the error data to send as error mail body
    public static function getErrorMailBody($error, $exception_flag=false) {
    	if ($exception_flag) {
	      	$message =  $error->getMessage() . "\n\n";
	      	if (preg_match('/favicon.ico/', $message)) {
				return;
			}
    	} else {
    		$arr = debug_backtrace();
	        $record1 = array_shift($arr);
	        $message = $error . "\n";
	        $message .= "FILE: " . $record1['file'] . ":" . $record1['line'] . "\n\n";
    	}

       	// Add the server info in the message body which is common for both error and exception
        $message .= "SERVER URL: " . BASE_URL . $_SERVER['REQUEST_URI'] . "\n\n";
        $message .= "SERVER REFERER: " . ((isset($_SERVER['HTTP_REFERER'])) ? $_SERVER['HTTP_REFERER'] : "NULL") . "\n\n";
        $message .= "User Agent: " . $_SERVER['HTTP_USER_AGENT'] . "\n\n";
        $message .= "USER IP: " . $_SERVER['REMOTE_ADDR'] . "\n\n";
        $message .= "Web Server: " . $_SERVER["SERVER_ADDR"] . "\n\n";
        $message .= "Database Server(s): " . implode(",", DB::$dbhosts) . "\n\n";

        // Add the extra data required for exception in the message body
    	if ($exception_flag) {
	      	$message .= "Exception caught\n";
	      	$message .= "---------------------\n";
	      	$message .= $error->getFile() . ':' . $error->getLine() . ':' . $error->getMessage() . "\n";
	      	$message .= "Stack Trace:\n" . $error->getTraceAsString(). "\n";
    	}

    	return $message;
    }
}

