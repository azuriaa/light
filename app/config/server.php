<?php

error_reporting(error_level: E_ALL);
ini_set(option: 'log_errors', value: true);
ini_set(option: 'error_log', value: ROOTPATH . 'logs/' . date('Y-m-d') . '.log');

ini_set(option: 'display_errors', value: true);

date_default_timezone_set(timezoneId: 'Asia/Jakarta');

define(constant_name: 'VIEWPATH', value: ROOTPATH . 'app/views');

array_push($_ENV, [
  'DEFAULT_DATABASE' => [
    'dsn' => 'mysql:dbname=test;host=localhost',
    'username' => 'root',
    'password' => '',
  ],
]);