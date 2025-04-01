<?php

// Debug
ini_set('display_errors', true);

// Timezone
date_default_timezone_set('Asia/Jakarta');

// Database
$_ENV['DB_DEFAULT'] = [
  'dsn' => 'mysql:dbname=test;host=localhost',
  'username' => 'root',
  'password' => '',
];
