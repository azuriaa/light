<?php

namespace Libraries;

use Libraries\Router;

class Server
{
  public function bootstrap($path): void
  {
    define('ROOTPATH', $path);

    // Autoloader
    spl_autoload_register(function ($class): void {
      $class = ROOTPATH . str_replace('\\', DIRECTORY_SEPARATOR, $class);
      require_once "$class.php";
    });

    // Logger
    error_reporting(E_ALL);
    ini_set('log_errors', true);
    ini_set('error_log', ROOTPATH . date('Y-m-d') . '.log');

    // Session
    session_save_path(ROOTPATH);

    // Header
    header_remove('X-Powered-By');

    // Config
    require_once ROOTPATH . 'Config/server.php';
    require_once ROOTPATH . 'Config/router.php';

    // Router
    Router::run();
  }
}
