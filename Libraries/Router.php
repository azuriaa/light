<?php

namespace Libraries;

use Libraries\Request;
use Libraries\Singleton;

class Router
{
  protected static array $routes = [];
  protected static $fallbackRoute;

  public static function run(): void
  {
    $request = Singleton::mount(Request::class);
    $target = explode(
      '/',
      $request->getRequestTarget(),
    );

    $route = $target[1];
    unset($target[0], $target[1]);

    if (key_exists($route, self::$routes) && !is_numeric($route)) {
      call_user_func_array(self::$routes[$route], $target);
    } else {
      call_user_func(self::$fallbackRoute);
    }
  }

  public static function add(string $route, callable $callback): void
  {
    $route = str_replace('/', '', $route);
    array_push(self::$routes, $route);
    self::$routes[$route] = $callback;
  }

  public static function fallback(callable $callback): void
  {
    self::$fallbackRoute = $callback;
  }

  public static function controller($controller, $id = null, $middleware = null): void
  {
    $request = Singleton::mount(Request::class);
    $controller = new $controller;
    $method = $request->getMethod();

    if (isset($middleware) && method_exists($middleware, 'before')) {
      $middleware::before();
    }

    if ($method == 'GET' && is_null($id) && method_exists($controller, 'index')) {
      $controller->index();
    } elseif ($method == 'GET' && isset($id) && method_exists($controller, 'show')) {
      $controller->show($id);
    } elseif ($method == 'POST' && method_exists($controller, 'create')) {
      $controller->create();
    } elseif (
      $method == 'PUT' && method_exists($controller, 'update') ||
      $method == 'PATCH' && method_exists($controller, 'update')
    ) {
      $controller->update($id);
    } elseif ($method == 'DELETE' && method_exists($controller, 'delete')) {
      $controller->delete($id);
    } else {
      call_user_func(self::$fallbackRoute);
    }

    if (isset($middleware) && method_exists($middleware, 'after')) {
      $middleware::after();
    }
  }
}
