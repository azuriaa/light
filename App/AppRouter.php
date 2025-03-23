<?php

namespace App;

use \Framework\Router;
use \App\Controllers\Home;

class AppRouter
{
  public static function register(): void
  {
    Router::add('/', function (): void {
      Router::controller(Home::class);
    });

    Router::fallback(function () {
      http_response_code(404);
      view('not_found');
    });
  }
}
