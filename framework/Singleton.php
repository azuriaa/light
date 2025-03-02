<?php

namespace Framework;

class Singleton
{
    protected static array $instances = [];

    public static function mount($service): mixed
    {
        if (!array_key_exists(key: $service, array: self::$instances)) {
            array_push(self::$instances, $service);
            self::$instances[$service] = new $service;
        }

        return self::$instances[$service];
    }
}