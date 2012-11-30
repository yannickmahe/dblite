<?php

class XMLExport {

	private $crlf = "\r\n";
	private $tab = "\t";

	public function exportHeader($dbname, $query, $table = '') {

		$head = '';

		$head .= "<?xml version='1.0' encoding='UTF-8'?>". $this->crlf;
		$head .= "<!--". $this->crlf;
	    $head .=  $this->commentPrefix('DBLite SQL Dump Version: '. VERSION). $this->crlf;
	    $head .=  $this->commentPrefix('http://www.manusis.com'). $this->crlf;
		$head .= "-->". $this->crlf;

		$dbname = $this->replaceSpacesWithDashes($dbname);

		$dbname = ($table)? $dbname . '_' . $table : $dbname;

		$xmlns = 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';

		$head .= '<resultset statement="' . $query . '"' . $xmlns . '>'. $this->crlf;

		$head .= $this->tab . '<database name="'. $dbname .'">'. $this->crlf;

	    print $head;
	}

	public function exportData($table, $query, $driver) {

		$data = '';

		$data_stmt = $driver->executeExportQuery($query);

		while($row = $data_stmt->fetch(PDO::FETCH_ASSOC)) {
			$data .= $this->tab. $this->tab. "<row>". $this->crlf;
			foreach($row as $column_name => $column_value) {
				$column_name = $this->replaceSpacesWithDashes($column_name);
				$data .= $this->tab. $this->tab. $this->tab .'<field name="' . $column_name . '">'. htmlspecialchars($column_value) . '</field>'. $this->crlf;
			}
			$data .= $this->tab. $this->tab. "</row>". $this->crlf;
		}

		print $data;
	}

	public function exportFooter() {

		$footer  = '';
		$footer .= $this->tab. "</database>". $this->crlf;
		$footer .= "</resultset>";

		print $footer;
	}

	public function commentPrefix($text) {
		return "- ". $text;
	}

	public function replaceSpacesWithDashes($text) {
		$text = str_replace(" ", "_", $text);

		return $text;
	}
}

?>
