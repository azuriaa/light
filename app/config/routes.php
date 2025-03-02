<?php

use \Framework\Router;
use \App\Controllers\Home;

Router::add(route: '/', callback: function (): void {
  Router::controller(controller: Home::class);
});