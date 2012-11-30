<?php

class Import {

	public function import_db($params) {
		set_time_limit(3600);
		$conn_id = $params['connection_id'];

		$data = new stdClass();
		$data->success = "pass";

		// check for demo version
		$is_demo_version = Utils::checkForDemoVersion();
		if($is_demo_version) {
			$data->success = "fail";
			$data->msg = "This feature is not available in demo version. <br /> Please <a href='http://dblite.com/download' target='_blank'>download</a> the full version or <a href='http://user.dblite.com' target='_blank'>register</a> with us.";
			print json_encode($data);
			exit;
		}


		if($_SERVER['REQUEST_METHOD'] == 'POST' &&  !$_FILES['restore_db_file']) {
			$data->msg = "Error in database import";
			if(!Utils::checkPostContentSize()) {
				$data->msg = "The uploaded file exceeds the upload_max_filesize/post_max_size directive in php.ini.";
			}
			$data->success = "fail";
			print json_encode($data);
			exit;
		}
		$filehandler = new FileHandler();
		try {

			$file_obj = $filehandler->handleUpload($_FILES['restore_db_file']);
			$sqlimport = new SqlImport($conn_id, $file_obj->file_tmp_name);
			$sqlimport->setDbConn();
			$sqlimport->importData();
			$data->msg = "Database imported successfully!";
			if(!$sqlimport->flag) {
				$data->success = "fail";
				$data->msg = $sqlimport->processed->msg;
			}

			print json_encode($data);
		}
		catch(Exception $e) {
			$data->success = "fail";
			$data->msg = $e->getMessage();
			print json_encode($data);
		}
		exit;
	}
}

?>
