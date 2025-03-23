<?php

function main(): void
{
  // Autoloader
  chdir(__DIR__);
  spl_autoload_register(function ($class): void {
    $class = str_replace('\\', DIRECTORY_SEPARATOR, $class);
    require_once "$class.php";
  });

  // Logger
  error_reporting(E_ALL);
  ini_set('log_errors', true);
  ini_set('error_log', 'log/' . date('Y-m-d') . '.log');
  ini_set('display_errors', true);

  // Database
  $_ENV['DB_DEFAULT'] = [
    'dsn' => 'mysql:dbname=test;host=localhost',
    'username' => 'root',
    'password' => '',
  ];

  // Helper
  function view(string $file, array $data = []): void
  {
    $renderer = \Framework\Singleton::mount(Framework\Renderer::class);
    $renderer->setup(viewPath: 'App/Views/', file: $file, data: $data)->render();
  }

  function database($config = 'DB_DEFAULT'): PDO|PDOStatement|null
  {
    return \Framework\Database::connect($config);
  }

  // Start ...
  date_default_timezone_set(timezoneId: 'Asia/Jakarta');
  \App\AppRouter::register();
  \Framework\Router::listen();
}
