<?php

// Point to your root project directory here
$path = __DIR__ . '/../';

require_once "$path/Libraries/Server.php";
$server = new Libraries\Server;
$server->bootstrap($path);
