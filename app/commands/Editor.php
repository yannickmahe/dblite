<?php

class Editor {

	private function get_base_query_dir() {
		$directory     = EDITORS_ROOT;
		$user = Session::$user;
		$session_id    = session_id();
		$parent_folder = isset($user->user_name) ? $user->user_name : $session_id;
		$directory     .= "/" . $parent_folder;
		return $directory;
	}

	private function get_query_folder_contents($folder="") {
		$directory = $this->get_base_query_dir();
		if($folder) $directory .= "/" . $folder;
		return Utils::readDirectoryContent($directory);
	}

	public function get_saved_queries($params) {
		$category = '';
		if(isset($params['category']))			$category = $params['category'];
		else if(isset($_REQUEST['category'])) 	$category = $_REQUEST['category'];
		
		$parent = '';
		if(isset($params['parent'])) 	$parent = $params['parent'];
		else if(isset($_REQUEST['parent'])) $parent = $_REQUEST['parent'];

		$node = '';
		if(isset($params['node'])) 	$node = $params['node'];
		else if(isset($_REQUEST['node'])) $node = $_REQUEST['node'];
		
		$directory = $this->get_base_query_dir();

		// if sql folder is being clicked
		if($category == 'folder'){
			$items = $this->get_query_folder_contents($node);
			$children = Utils::createQueryTreeNodes($items, $directory, $node);
			return $children;
		}

		// load tree initially
		else {
			$output = new stdClass();
			$output->id       = 'sqls';
			$output->text     = 'SQLs';
			$output->category = 'contanier';
			$output->iconCls  = 'sql_container';
			$output->expanded = true;
			$items = $this->get_query_folder_contents();
			$children = Utils::createQueryTreeNodes($items, $directory);
			$output->children = $children;
			return array($output);
		}
	}

	public function delete_query_editor($params) {
		// check for demo version
		$is_demo_version = Utils::checkForDemoVersion();
		if($is_demo_version) {
			throw new Exception("This feature is not available in demo version. <br /> Please <a href='http://dblite.com/download' target='_blank'>download</a> the full version or <a href='http://user.dblite.com' target='_blank'>register</a> with us.");
			return;
		}


		$folder	= $params['folder'];
		$file   = $params['file'];
		$output = new stdClass;
		if(!$file && !$folder) return $output;

		$dir_name = $this->get_base_query_dir();
		if($folder) $dir_name .= "/" . $folder;
		if($file)   $dir_name .= "/" . $file;
		$folder_contents = Utils::readDirectoryContent($dir_name);
		$ret = Utils::recursiveDelete($dir_name);
		if($ret) {
			$output->success = true;
			if($folder_contents) {
				$output->files = $folder_contents;
			}
		}
		else {
			$target = ($folder) ? ($folder . "/" . $file) : $file;
			$output->msg = "The file ../$target could not be deleted";
			$output->success = false;
		}
		return $output;
	}

	public function save_sql_editor($params) {

		// check for demo version
		$is_demo_version = Utils::checkForDemoVersion();
		if($is_demo_version) {
			throw new Exception("This feature is not available in demo version. <br /> Please <a href='http://dblite.com/download' target='_blank'>download</a> the full version or <a href='http://user.dblite.com' target='_blank'>register</a> with us.");
			return;
		}


		$data         = $params['sql'];
		$folder       = $params['folder_name'];
		$file         = $params['file_name'];
		$replace_flag = $params['replace'];

		$user = Session::$user;
		$session_id = session_id();
		$parent_folder = ($user->user_id) ? $user->user_name : $session_id;
		$output = new stdClass();

		if(!$file) {
			return $output;
		}
		//$file = str_ireplace('.sql', '', $file);

		try {
			$dir_name = EDITORS_ROOT . "/" . $parent_folder;
			if(!is_dir($dir_name)) {
				if(!mkdir($dir_name)){
				}
				if($folder) {
					$dir_name = $dir_name . "/" . $folder;
					if(!is_dir($dir_name)){
						if(!mkdir($dir_name)){
						}
					}
				}
			}
			else {
				if($folder) {
					$dir_name = $dir_name . "/" . $folder;
					if(!is_dir($dir_name)){
						if(!mkdir($dir_name)){
						}
					}
				}
			}

			//$filename = $dir_name . "/" . $file . ".sql";
			$filename = $dir_name . "/" . $file;
			//$target = ($folder) ? ($folder . "/" . $file . ".sql") : ($file . ".sql");
			$target = ($folder) ? ($folder . "/" . $file) : $file;

			if (file_exists($filename) && $replace_flag != 'REPLACE') {
				$output->msg = "The file ../$target already exists.";
				$output->success = false;
				$output->duplicate = true;
				return $output;
			}
			else {
				$fp = fopen($filename, 'w');
				fwrite($fp, $data);
				fclose($fp);
				$output->foldername = $folder;
				//$output->filename = $file.".sql";
				$output->filename = $file;
			}
		}
		catch(Exception $e){
			$output->msg = $e->getMessage();
			return $output;
		}

		$output->success = true;
		return $output;
	}

	public function rename_query_file($params) {

		// check for demo version
		$is_demo_version = Utils::checkForDemoVersion();
		if($is_demo_version) {
			throw new Exception("This feature is not available in demo version. <br /> Please <a href='http://dblite.com/download' target='_blank'>download</a> the full version or <a href='http://user.dblite.com' target='_blank'>register</a> with us.");
			return;
		}


		$output = new stdClass();
		$output->success = true;

		$oldFilename = $params['oldFilename'];
		$newFilename = $params['newFilename'];
		$folder = $params['folder'];

		$retData = $this->get_query_file_content(Array(
		  'file' => $oldFilename,
		  'folder' => $folder));

		$content = $retData->content;

		$this->save_sql_editor(Array(
		  'sql' => $content,
		  'folder_name' => $folder,
		  'file_name' => $newFilename));

		$this->delete_query_editor(Array(
		  'file' => $oldFilename,
		  'folder' => $folder));

		return $output;
	}

	public function get_query_file_content($params) {
		$file = $params['file'];
		$folder = $params['folder'];

		$directory     = EDITORS_ROOT;
		$user = Session::$user;
		$session_id    = session_id();
		$parent_folder = ($user->user_id) ? $user->user_name : $session_id;
		$directory    .= "/" . $parent_folder;

		$output = new stdClass();
		$output->success = true;

		if(!$file) {
			$output->success = false;
			$output->msg = "File name not passed!";
			return $output;
		}

		$file_path = $folder ? ($folder . "/" . $file) : $file;
		$actual_path = $directory . "/" . $file_path;

		if (is_readable($actual_path)) {
			$output->content = file_get_contents($actual_path, FILE_USE_INCLUDE_PATH);
		} else {
			$output->success = false;
			$output->msg = "The file $file_path does not exist and/or is not readable!";
		}

		return $output;
	}

}

?>
