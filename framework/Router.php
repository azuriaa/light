<?php

namespace Framework;

use Framework\Request;

class Router
{
    protected static array $routes = [];
    protected static $fallBack = VIEWPATH . '/not_found.html';

    public static function start(): void
    {
        $target = explode(
            separator: '/',
            string: Request::getRequestTarget(),
        );

        $route = $target[1];
        unset($target[0], $target[1]);

        if (key_exists(key: $route, array: self::$routes)) {
            call_user_func_array(callback: self::$routes[$route], args: $target);
        } else {
            require_once self::$fallBack;
        }
    }

    public static function add(string $route, callable $callback): void
    {
        $route = str_replace(search: '/', replace: '', subject: $route);
        array_push(self::$routes, $route);
        self::$routes[$route] = $callback;
    }

    public static function controller($controller, $id = null, $middleware = null): void
    {
        $controller = new $controller;
        $method = Request::getMethod();

        if (isset($middleware) && method_exists(object_or_class: $middleware, method: 'before')) {
            $middleware::before();
        }

        if ($method == 'GET' && is_null(value: $id) && method_exists(object_or_class: $controller, method: 'index')) {
            $controller->index();
        } elseif ($method == 'GET' && isset($id) && method_exists(object_or_class: $controller, method: 'show')) {
            $controller->show($id);
        } elseif ($method == 'POST' && method_exists(object_or_class: $controller, method: 'create')) {
            $controller->create();
        } elseif (
            $method == 'PUT' && method_exists(object_or_class: $controller, method: 'update') ||
            $method == 'PATCH' && method_exists(object_or_class: $controller, method: 'update')
        ) {
            $controller->update($id);
        } elseif ($method == 'DELETE' && method_exists(object_or_class: $controller, method: 'delete')) {
            $controller->delete($id);
        } else {
            require_once self::$fallBack;
        }

        if (isset($middleware) && method_exists(object_or_class: $middleware, method: 'after')) {
            $middleware::after();
        }
    }
}