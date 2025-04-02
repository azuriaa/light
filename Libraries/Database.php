<?php

namespace Libraries;

use \PDO;
use \PDOStatement;

class Database
{
  protected static array $dbh = [];

  public static function connect(string $config): PDO|PDOStatement|null
  {
    if (!isset(self::$dbh[$config])) {
      self::$dbh[$config] = new PDO(
        $_ENV[$config]['dsn'],
        $_ENV[$config]['username'],
        $_ENV[$config]['password'],
      );

      self::$dbh[$config]->setAttribute(
        PDO::ATTR_DEFAULT_FETCH_MODE,
        PDO::FETCH_ASSOC,
      );
    }

    return self::$dbh[$config];
  }

  public static function close(string $config): void
  {
    self::$dbh[$config] = null;
  }
}
