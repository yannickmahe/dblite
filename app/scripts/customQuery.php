<?php

include_once '../../common.php';

if($_REQUEST['query'])
  $result = execQuery($_REQUEST['query']);

function execQuery($query) {
		
      try
      {
    		//$query = "select * from user_connections;";
    		
    		$dbh = DB::getConnection(DB::TYPE_SQLITE, array("file" => USERS_DB_PATH));
    
    		$result = $dbh->fetchAll($query);
    		$response = new stdClass();
    		$response->data = '';
    		for($i=0; $i<count($result); $i++)
    		{
    		  $response->data .= "<li>".json_encode($result[$i])."</li>";
    		}
    		$response->count = count($result);
    	  return ($response);
      }
      catch(Exception $exception)
      {
        $response->data = json_encode($exception);
        return $response;
      }
}

?>
<html>
  <head>
    <title> Execute SQLite query</title>
  </head>
  <body>
    <form method="get">
      Query: <br />
      <textarea style="display: block; width: 100%;" name="query"><?php echo $_REQUEST['query']; ?></textarea>
      <input name="submit" type="submit" />
    </form>
    <div>
      <?php echo $result->count;?>
      <hr />
      <?php echo $result->data; ?>
    </div>
  </body>
</html>