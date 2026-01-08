<?php

namespace Libraries;

use \PDO;
use \PDOStatement;
use Libraries\Database;

abstract class Model
{
  protected string $config = 'DB_DEFAULT';
  protected string $table;
  protected string $primaryKey;

  public function connect(): PDO|PDOStatement|null
  {
    return Database::connect($this->config);
  }

  public function disconnect(): void
  {
    Database::close($this->config);
  }

  public function getAll(): array
  {
    return $this->connect()
      ->query("SELECT * FROM $this->table")
      ->fetchAll();
  }

  public function find($id): array
  {
    $connection = $this->connect();
    $stmt = $connection
      ->prepare("SELECT * FROM $this->table WHERE $this->primaryKey = ?");
    $stmt->execute([$id]);

    return $stmt->fetchAll();
  }

  public function insert(array $data): bool
  {
    $fields = '';
    $placeholder = '';
    foreach (array_keys($data) as $key) {
      $fields = ($fields == '') ? $key : "$fields, $key";
      $placeholder = ($placeholder == '') ? '?' : "$placeholder, ?";
    }

    $values = array_values($data);

    return $this->connect()
      ->prepare("INSERT INTO $this->table ($fields) VALUES ($placeholder)")
      ->execute($values);
  }

  public function update(array $data, $id): bool
  {
    $placeholder = '';
    foreach (array_keys($data) as $key) {
      $placeholder = ($placeholder == '') ? "$key = ?" : "$placeholder, $key = ?";
    }

    $values = array_values($data);
    array_push($values, $id);

    return $this->connect()
      ->prepare("UPDATE $this->table SET $placeholder WHERE $this->primaryKey = ?")
      ->execute($values);
  }

  public function delete($id): bool
  {
    return $this->connect()
      ->prepare("DELETE FROM $this->table WHERE $this->primaryKey = ?")
      ->execute([$id]);
  }
}
