<?php


class SetupUtils {

	public static function createOrUpgradeSchema($user_dsn, $version){
		$dbh = DB::getConnection($user_dsn['type'], $user_dsn);
		if($user_dsn['type'] == DB::TYPE_SQLITE) {
			$metadata_exists = $dbh->fetchSingleColumn("SELECT * FROM sqlite_master WHERE type='table' and name = 'metadata'");
			if(!$metadata_exists) {
				self::createSqliteSchema($dbh, $version);
			}
			else {
				self::upgradeSqliteSchema($dbh, $version);
			}
		}
		else if($user_dsn['type'] == DB::TYPE_MYSQL){
			$metadata_exists = $dbh->fetchSingleColumn("show tables like 'metadata'");
			if(!$metadata_exists) {
				self::createMysqlSchema($dbh, $version);
			}
			else {
				self::upgradeMysqlSchema($dbh, $version);
			}
		}
		else {
			throw new Exception("\$config['user_dsn']['type'] not supported");
		}
	}

	public static function createSqliteSchema($dbh, $version) {
		$dbh->beginTransaction();
		print "Creating `metadata` table \n";
		$dbh->execute("CREATE TABLE metadata (version VARCHAR(50))");
		$dbh->insert("metadata" , array("version" => $version));

		print "Creating `users` table \n";
		$dbh->execute("CREATE TABLE users
				   ( user_id INTEGER PRIMARY KEY AUTOINCREMENT,
					 user_name VARCHAR(255),
					 email_id VARCHAR(255),
					 password VARCHAR(255),
					 last_logged_on TIMESTAMP,
					 created_on TIMESTAMP)"
					 );

		 print "Creating `user_connections` table \n";
		 $dbh->execute("CREATE TABLE user_connections
				   ( connection_id INTEGER PRIMARY KEY AUTOINCREMENT,
					 user_id INTEGER,
					 connection_name VARCHAR(255),
					 type VARCHAR(255),
					 host VARCHAR(255),
					 port INTEGER(255),
					 user VARCHAR(255),
					 password VARCHAR(255),
					 database VARCHAR(255),
					 save_password BOOL DEFAULT false)"
					 );

		 print "Creating `user_activity_state` table \n";
		 $dbh->execute("CREATE TABLE user_activity_state
				   ( user_id INTEGER,
					 activity_key VARCHAR(255),
					 activity_value VARCHAR(255),
					 PRIMARY KEY (`user_id`, `activity_key`))"
					 );
					 $dbh->commit();
		print "Finished creating schema for version [$version]\n";
	}

	public static function createMysqlSchema($dbh, $version) {

		$dbh->beginTransaction();
		print "Creating `metadata` table \n";
		$dbh->execute("CREATE TABLE metadata (version VARCHAR(50)) DEFAULT CHARSET=utf8");
		$dbh->insert("metadata" , array("version" => $version));

		print "Creating `users` table \n";
		$dbh->execute("CREATE TABLE users
				   ( user_id INTEGER PRIMARY KEY AUTO_INCREMENT,
					 user_name VARCHAR(255),
					 email_id VARCHAR(255),
					 password VARCHAR(255),
					 last_logged_on TIMESTAMP,
					 created_on TIMESTAMP) DEFAULT CHARSET=utf8"
					 );

		print "Creating `user_connections` table \n";
		$dbh->execute("CREATE TABLE user_connections
				   ( connection_id INTEGER PRIMARY KEY AUTO_INCREMENT,
					 user_id INTEGER,
					 connection_name VARCHAR(255),
					 type VARCHAR(255),
					 host VARCHAR(255),
					 port INTEGER(255),
					 user VARCHAR(255),
					 password VARCHAR(255),
					 database VARCHAR(255),
					 save_password BOOL DEFAULT false) DEFAULT CHARSET=utf8"
					 );

		print "Creating `user_activity_state` table \n";
		$dbh->execute("CREATE TABLE user_activity_state
				   ( user_id INTEGER,
					 activity_key VARCHAR(255),
					 activity_value VARCHAR(255),
					 PRIMARY KEY (`user_id`, `activity_key`)) DEFAULT CHARSET=utf8"
					 );
					 $dbh->commit();
		print "Finished creating schema for version [$version]\n";
					 
	}

	public static function upgradeSqliteSchema($dbh, $version) {

		$oldVersion = $dbh->fetchSingleColumn("select version from metadata");
		if($oldVersion == $version) {
			print "The schema is up to date [Version: $version] \n";
			exit;
		}
		print "Upgrading schema from $oldVersion to $version \n";

		//	if($oldVersion < 0.4) {
		//		print "Creating `feedback` table \n";
		//		$dbh->execute("CREATE TABLE feedback
		//				   		( feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
		//					 	  user_id INTEGER,
		//					 	  feedback_category VARCHAR,
		//					      feedback_message text,
		//					      user_email VARCHAR,
		//					      file BOOL DEFAULT false)"
		//				     );
		//	}
		//
		$dbh->prepareAndExecute("update metadata set version='$version';");
		$dbh->commit();
	}

	public static function upgradeMysqlSchema($dbh, $version) {

		$oldVersion = $dbh->fetchSingleColumn("select version from metadata");
		if($oldVersion == $version) {
			print "The schema is up to date [Version: $version] \n";
			exit;
		}
		print "Upgrading schema from $oldVersion to $version \n";

		//	if($oldVersion < 0.4) {
		//		print "Creating `feedback` table \n";
		//		$dbh->execute("CREATE TABLE feedback
		//				   		( feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
		//					 	  user_id INTEGER,
		//					 	  feedback_category VARCHAR,
		//					      feedback_message text,
		//					      user_email VARCHAR,
		//					      file BOOL DEFAULT false)"
		//				     );
		//	}
		//
		$dbh->prepareAndExecute("update metadata set version='$version';");
		$dbh->commit();
	}

}
?>
