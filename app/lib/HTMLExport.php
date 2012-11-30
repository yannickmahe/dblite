<?php

class HTMLExport {

	private $crlf = "\r\n";
	private $tab = "\t";

	public function exportHeader($dbname, $query, $table = '') {

		$head = '';
		$dbname = $this->replaceSpacesWithDashes($dbname);
		$dbname = ($table)? $dbname . '_' . $table : $dbname;
		$head .= "<TABLE NAME='$dbname' BORDER='1'>". $this->crlf;
	    print $head;
	}

	public function exportData($table, $query, $driver) {

		$data = '';

		$data_stmt = $driver->executeExportQuery($query);
		$i = 1;
		while($row = $data_stmt->fetch(PDO::FETCH_ASSOC)) {
			if($i == 1) {
				$data .= $this->tab. "<TR>". $this->crlf;
				foreach($row as $column_name => $column_value) {
					$column_name = $this->replaceSpacesWithDashes($column_name);
					$data .= $this->tab. $this->tab. "<TH>". $column_name . "</TH>". $this->crlf;
				}
				$data .= $this->tab. "</TR>". $this->crlf;
			}

			$data .= $this->tab. "<TR>". $this->crlf;
			foreach($row as $column_name => $column_value) {
				$data .= $this->tab. $this->tab. '<TD>'. htmlspecialchars($column_value) . '</TD>'. $this->crlf;
			}
			$data .= $this->tab. "</TR>". $this->crlf;

			$i++;
		}

		print $data;
	}

	public function exportFooter() {

		$footer  = '';
		$footer .= "</TABLE>";

		print $footer;
	}

	public function replaceSpacesWithDashes($text) {
		$text = str_replace(" ", "_", $text);

		return $text;
	}
}
?>
