<?php

class DBliteMailer extends Mailer {

	public static function sendDbLiteMail($to, $subject, $body, $from=NULL, $headers=NULL) {
		$Mailer = new Mailer();
		$Mailer->IsHTML(true);
		$Mailer->Subject = $subject;
		$Mailer->Body = $body;
		$Mailer->AddAddresses($to);

		if (!is_null($from)) {
			$Mailer->From = $from;
		} else {
			$Mailer->From = "support@manusis.com";
		}

		$Mailer->FromName = "support";
		$Mailer->Sender = "support@manusis.com";

		if (!is_null($headers)) {
			$Mailer->AddCustomHeader($headers);
		}

		if (!$Mailer->send()) {
			Logger::error("Mailer Error: " . $Mailer->ErrorInfo);
			return false;
		}

		return true;
	}

	// reset password email
	public static function SendResestPasswordEmail($username, $email_id, $new_password) {
		$subject = "Password Reset";

		$body = <<<EMBODY
					<html>
					  <head>
					    <title>Password Reset Email</title>
					  </head>
					  <body>
					    <p>Hi <strong>$username</strong>,</p>
					    <p>As per your request we have rest your password as mentioned below.</p>
					    <p>New Password: <b>$new_password</b></p>
					    <p>We request you to login and change your password.</p>
					    <p>
					      Thanks, <br />
					      DBLite Team
					    </p>
					  </body>
					</html>
EMBODY;

		return self::sendDbLiteMail($email_id, $subject, $body);
	}

	// To send the registration confirmation mail.
	public static function sendRegistrationConfirmationEmail($username, $email_id) {
		$subject = "Registration Confirmation";

		$body = <<<EMBODY
			<html>
			  <head>
			    <title>Registration Confirmation</title>
			  </head>
			  <body>
			    <p>Hi <strong>$username</strong>,</p>
			    <p>Thank you for registering at DBLite.</p>
			    <p>
			      Thanks, <br />
			      DBLite Team
			    </p>
			  </body>
			</html>
EMBODY;
		return self::sendDbLiteMail($email_id, $subject, $body);
	}

	// To send the changes notification mail
	public static function sendChangeNotificationEmail($username, $email_id, $changes) {
		$subject = "Change Notification";

		$changesString = '';

		for($i=0; $i<count($changes); $i++) {
			$changesString .= "<li>$changes[$i]</li>";
		}

		$body = <<<EMBODY
				<html>
				  <head>
				    <title>Change Notification</title>
				  </head>
				  <body>
				    <p>Hi <strong>$username</strong>,</p>
				    <p>Following detials of yours has been changed successfully.</p>
				    <ul>
				    $changesString
				    </ul>
				    <p>
				      Thanks, <br />
				      DBLite Team
				    </p>
				  </body>
				</html>
EMBODY;

				    return self::sendDbLiteMail($email_id, $subject, $body);
	}


	// To send the user feedbacks
	public static function sendFeedbackEmail($username, $email, $category, $message, $attachment) {
		$subject = "User Feedback";

		if($attachment->content) {
			$attach = <<<ATTA
				Content-Type: $attachment->ftype; name="$attachment->fname"
				Content-Transfer-Encoding: base64
				Content-Disposition: attachment; filename="$attachment->fname"
				$attachment->content
ATTA;
			$body = <<<EMBODY
				<html>
				  <head>
				    <title>User Feedback</title>
				  </head>
				  <body>
				    <p>Hi <strong>DBLite Team</strong>,</p>
				    <p>$message</p>
				    <p>

				      	Thanks, <br />
				      	$username <br />
					  	$email
				    </p>
				    <hr />
				    <p>
						$attach
					</p>
				  </body>
				</html>
EMBODY;
		} else {
			$body = <<<EMBODY
				<html>
				  <head>
				    <title>User Feedback</title>
				  </head>
				  <body>
				    <p>Hi <strong>DBLite Team</strong>,</p>
				    <p>$message</p>
				    <p>
				      Thanks, <br />
				      $username <br />
					  $email
				    </p>
				  </body>
				</html>
EMBODY;
		}
		
		return self::sendDbLiteMail("rajiv@manusis.com", $subject, $body);

	}
}
?>
