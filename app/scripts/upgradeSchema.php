<?php

include_once '../../common.php';
include_once '../../config.php';

print "<pre>";
SetupUtils::createOrUpgradeSchema($config['user_dsn'], $config['version']);

?>
