<?php

use Libraries\Router;
use Controllers\Home;

Router::add('/', function (): void {
  Router::controller(Home::class);
});

Router::fallback(function () {
  http_response_code(404);
  include ROOTPATH . 'Views/not_found.php';
});
