<?php

class Utils {

	// function to delte file/folder
	public static function recursiveDelete($str){
		if(is_file($str)){
			return unlink($str);
		}
		elseif(is_dir($str)){
			$scan = glob(rtrim($str,'/').'/*');
			foreach($scan as $index=>$path){
				Utils::recursiveDelete($path);
			}
			return rmdir($str);
		}
	}

	// function to read directory content
	public static function readDirectoryContent($directory){
		if(is_dir($directory)) {
			$dirs = array();
			if ($handle = opendir($directory)) {
				while (false !== ($item = readdir($handle))) {
					if (($item != ".") && ($item != "..") && ($item != ".svn")) {
						$dirs[] = $item;
					}
				}
				closedir($handle);
			}
			return $dirs;
		}
	}

	// copy full directory
	public static function copyDirectory($source, $target) {
		if(is_dir($source)) {

			if(!is_dir($target)){
				if(!mkdir($target)){}
			}

			if ($handle = opendir($source)) {
				while (false !== ($item = readdir($handle))) {
					if (($item == ".") || ($item == "..") || ($item == ".svn")) {
						continue;
					}

					$entry = $source . '/' . $item;
					if(is_dir($entry)) {
						Utils::copyDirectory($entry, $target . '/' . $item);
						continue;
					}
					copy($entry, $target . '/' . $item );
				}
				closedir($handle);
			}
		}else {
			copy($source, $target);
		}
	}



	// function to create sql browser tree nodes
	public static function createQueryTreeNodes($elements, $directory, $parent= '') {
		$children = array();
		if(!count($elements)) {
			return $children;
		}

		foreach($elements as $d ){
			$node = new stdClass();
			$node->text = $d;

			$is_file = ($parent == $d) ? true : false;

			if(is_dir($directory."/".$d) && !$is_file) {
				$node->category = 'folder';
				$node->id = 'folder=' . $d;
				$node->iconCls = 'folder_page';
				$node->expanded = true;
				$node->folder_name = $d;
			}
			else {
				$node->category = 'file';
				$node->id = 'file='. ($parent ? ($parent. '.' . $d) : $d);
				$node->leaf = true;
				$node->iconCls = 'page_leaf';
				$node->file_name = $d;
				$node->folder_name = $parent;
			}
			$children[] = $node;
		}

		return $children;
	}

	//	// function to create explorer tree nodes
	//	public static function createExplorerTreeNodes($items, $cls, $category) {
	//		$nodes = array();
	//		if(!count($items)) {
	//			return $nodes;
	//		}
	//
	//		foreach($items as $item) {
	//			$node = new stdClass();
	//			$node->id = $item;
	//			$node->text = $item;
	//			$node->cls = $cls;
	//			$node->category = $category;
	//			$nodes[]  = $node;
	//		}
	//		return $nodes;
	//	}

	// function to get the corresponding db/table structure details
	public static function getStructureDetails($default_headers, $title, $data) {
		$child_item = new stdClass();
		$child_item->title = $title;
		$child_item->data = (array)$data;

		$child_data = (array)$child_item->data[0];
		if($child_data['Create Table']){
			$child_data['Create_Table'] = nl2br($child_data['Create Table']);
			unset($child_data['Create Table']);
			$child_item->data[0] = (object)$child_data;
		}
		elseif($child_data['Create Database']) {
			$child_data['Create_Database'] = nl2br($child_data['Create Database']);
			unset($child_data['Create Database']);
			$child_item->data[0] = (object)$child_data;
		}

		$field_names = $child_item->data ? array_keys((array)$child_item->data[0]) : $default_headers;
		$child_item->fields = $field_names;
		$child_item->columns = Utils::createHeadersList($field_names);

		return $child_item;
	}

	// function to create an array of db/table structure item keys
	public static function createHeadersList($item) {
		$headres  = array();
		foreach($item as $key => $val) {
			$headres[$key]->header = str_replace('_', ' ', $val);
			$headres[$key]->dataIndex = $val;

			if($val == "Create_Table" || $val == "Create_Database") {
				$headres[$key]->width = .9;
			}
		}
		return $headres;
	}

	// function to get saved query files content
	public static function getSavedQueries($file_path){
		if(is_readable($file_path)) {
			if($file_content = file_get_contents($file_path, FILE_USE_INCLUDE_PATH)) {
				return $file_content;
			}
		}
	}

	// function to validate database name
	public static function validateDatabaseName($db_name){
		$output = new stdClass();
		$output->success = true;

		if(!$db_name) {
			$output->success = false;
			$output->msg = "Form fields could not be submitted with empty value(s)";
		}
		elseif(!preg_match('/^[a-zA-Z0-9_.-]*$/i', $db_name)) {
			$output->success = false;
			$output->msg = "Username is not valid";
		}
		return $output;
	}

	// function to validate table name
	public static function validateTableName($table, $rename){
		$output = new stdClass();
		$output->success = true;

		if(!$rename || ($table == $rename)) {
			$output->success = false;
			$output->msg = "Please enter a new table name";
		}
		elseif(!preg_match('/^[a-zA-Z0-9_.-]*$/i', $rename)) {
			$output->success = false;
			$output->msg = "Table name is not valid";
		}
		return $output;
	}

	// fnction to create explorer tree node
	public static function createExplorerTreeNode($attributes) {
		$node = new stdClass();
		foreach($attributes as $attrib_name=>$attrib_value) {
			$node->$attrib_name = $attrib_value;
		}
		return $node;
	}

	public static function checkPostContentSize() {
		$POST_MAX_SIZE = ini_get('post_max_size');
		$mul = substr($POST_MAX_SIZE, -1);
		$mul = ($mul == 'M' ? 1048576 : ($mul == 'K' ? 1024 : ($mul == 'G' ? 1073741824 : 1)));
		if (($_SERVER['CONTENT_LENGTH'] > $mul*(int)$POST_MAX_SIZE) && $POST_MAX_SIZE) $error = true;
		if($error) {
			return 0;
		}

		return true;
	}


	/**
	 * Recursive version of glob
	 *
	 * @return array containing all pattern-matched files.
	 *
	 * @param string $sDir      Directory to start with.
	 * @param string $sPattern  Pattern to glob for.
	 * @param int $nFlags       Flags sent to glob.
	 */
	public static function globr($sDir, $sPattern, $nFlags = NULL)
	{
		$sDir = escapeshellcmd($sDir);

		// Get the list of all matching files currently in the
		// directory.

		$aFiles = glob("$sDir/$sPattern", $nFlags);

		// Then get a list of all directories in this directory, and
		// run ourselves on the resulting array.  This is the
		// recursion step, which will not execute if there are no
		// directories.

		foreach (glob("$sDir/*", GLOB_ONLYDIR) as $sSubDir)
		{
			$aSubFiles = self::globr($sSubDir, $sPattern, $nFlags);
			$aFiles = array_merge($aFiles, $aSubFiles);
		}

		// The array we return contains the files we found, and the
		// files all of our children found.

		return $aFiles;
	}

	public static function insertBackTicks($text) {
		if(!is_array($text)) {
			return "`" . $text . "`";
		}

		$text_array = array();
		foreach($text as $val) {
			$text_array[] = "`" . $val . "`";
		}

		return $text_array;
	}

	public static function insertQuotes($rows = '') {
		$row_set = array();

		if(is_array($rows)) {
			foreach($rows as $row) {
				$row_set[] = "'" . addslashes($row) . "'";
			}
		}
		else {
			return "'". addslashes($rows) . "'";
		}
		return $row_set;
	}

	public static function getRandomStr() {
		$length = 16;
		$chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		// Length of character list
		$chars_length = (strlen($chars) - 1);

		// Start our string
		$string = $chars{rand(0, $chars_length)};

		// Generate random string
		for ($i = 1; $i < $length; $i = strlen($string))
		{
			// Grab a random character from our list
			$r = $chars{rand(0, $chars_length)};

			// Make sure the same two characters don't appear next to each other
			if ($r != $string{$i - 1}) $string .=  $r;
		}

		// Return the string
		return $string;
	}

	public static function readFile($file, $start, $limit) {
		$file_obj = new SplFileObject($file);
		$data = array();

		for($i=$start; $i<($start+$limit); $i++) {
			$file_obj->seek($i);
			$line =  $file_obj->current();
			if($line) {
				$data[] = $line;
			} else {
				break;
			}
		}
		return $data;
	}


	public static function checkForDemoVersion() {
		$host = $_SERVER["SERVER_NAME"];
		if(stristr($host, "demo.dblite.com") === FALSE) {
			return false;
		}
		return true;	
	}
	
//	public static function checkForUserVersion() {
//		$host = $_SERVER["SERVER_NAME"];
//		if(stristr($host, "user.dblite.com") === FALSE) {
//			return false;
//		}
//		return true;	
//	}
	
	public static function checkForRestrictedCommands($sqlstr) {
		if(preg_match("/(create|update|delete|drop|set|alter|insert|load|truncate|rename)[\s]+/i", $sqlstr)) {
			return true;
		}
		return false;
	}	
	
}

?>
