<?php

namespace App;

use Framework\Router;

class App
{
  public static function main(): void
  {
    define(constant_name: 'ROOTPATH', value: realpath(path: __DIR__) . '/../');
    require_once ROOTPATH . 'app/config/server.php';

    spl_autoload_register(callback: function ($class): void {
      require_once ROOTPATH . "$class.php";
    });

    require_once ROOTPATH . 'app/config/routes.php';
    Router::start();
  }
}
