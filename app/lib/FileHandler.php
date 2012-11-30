<?php

class FileHandler {

    public $errors = array();
    protected $allowed_extensions = array("sql");

    private $uploadErrors = array(
        UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the upload_max_filesize directive in php.ini.',
        UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form.',
        UPLOAD_ERR_PARTIAL => 'The uploaded file was only partially uploaded.',
        UPLOAD_ERR_NO_FILE => 'No file was uploaded.',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder.',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
        UPLOAD_ERR_EXTENSION => 'File upload stopped by extension.',
    );

    public function handleUpload($upload_file) {
        if(!$upload_file) {
            throw new FileHandlerException($error_msg, Error::FILE_EMPTY, "upload_err_empty");
        }

        $file  = new stdClass();
        $file->file_orig_name = $upload_file['name'];
        $file->file_size	  = $upload_file['size'];
        $path_parts = pathinfo($file->file_orig_name);
        $file->file_extension = strtolower($path_parts['extension']);
        $file->file_mime_type = $upload_file['type'];
        $file->file_tmp_name = $upload_file['tmp_name'];

        if(!in_array($file->file_extension, $this->allowed_extensions)) {
	        throw new FileHandlerException("File extension [$file->file_extension] not supported", Error::FILE_NOT_AN_IMAGE, "upload_err_invalid_format");
        }
        
        $error = $upload_file['error'];
        if($error) {
            $error_msg = $this->uploadErrors[$error];
            if($error == UPLOAD_ERR_INI_SIZE || $error == UPLOAD_ERR_FORM_SIZE || $error == UPLOAD_ERR_PARTIAL) {
                throw new FileHandlerException($error_msg, Error::FILE_SIZE_EXCEEDED, "upload_err_size_exceeded");
            }
            if($error == UPLOAD_ERR_NO_FILE) {
                throw new FileHandlerException($error_msg, Error::FILE_EMPTY, "upload_err_empty");
            }
            else {
                throw new FileHandlerException($error_msg, Error::FILE_UNKNOWN_UPLOAD_ERROR, "upload_unknown_error");
            }
        }

        return $file;
    }
}

class FileHandlerException extends Exception {
    private $error_key;
    public function FileHandlerException($message, $code, $error_key="") {
        parent::__construct($message, $code);
        $this->error_key = $error_key;
    }
    public function getErrorKey() {
        return $this->error_key;
    }
}

?>