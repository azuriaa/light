<?php

namespace Libraries;

class Singleton
{
    protected static array $instances = [];

    public static function mount($class): mixed
    {
        if (!array_key_exists($class, self::$instances)) {
            array_push(self::$instances, $class);
            self::$instances[$class] = new $class;
        }

        return self::$instances[$class];
    }
}
