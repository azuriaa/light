<?php

namespace Framework;

use \PDO;
use \PDOStatement;

abstract class Model
{
  protected PDOStatement|PDO|null $dbh;
  protected string $config = 'DEFAULT_DATABASE';
  protected string $table = 'test';
  protected string $primaryKey = 'id';

  public function connect(): PDO|PDOStatement|null
  {
    if ($this->dbh == null) {
      $this->dbh = new PDO(
        dsn: $_ENV[$this->config]['dsn'],
        username: $_ENV[$this->config]['username'],
        password: $_ENV[$this->config]['password']
      );
    }

    return $this->dbh;
  }

  public function findAll(): array
  {
    return $this->connect()
      ->query("SELECT * FROM $this->table")
      ->fetchAll(PDO::FETCH_ASSOC);
  }

  public function find($id): array|bool
  {
    $result = $this
      ->connect()
      ->prepare(query: "SELECT * FROM $this->table WHERE $this->primaryKey = ?")
      ->execute(params: [$id]);

    if ($result) {
      return $this->dbh->fetchAll(PDO::FETCH_ASSOC);
    } else {
      return $result;
    }
  }

  public function insert(array $data): bool
  {
    $fields = implode(", ", array_keys($data));
    $placeholders = str_repeat('?, ', count(array_keys($data)) - 1) . '?';

    return $this
      ->connect()
      ->prepare(query: "INSERT INTO $this->table ($fields) VALUES ($placeholders)")
      ->execute(params: array_values($data));
  }

  public function update(array $data, $id): bool
  {
    $changes = implode(" = ?,", array_keys($data));
    $values = array_values($data);
    array_push($values, [$id]);

    return $this
      ->connect()
      ->prepare(query: "UPDATE $this->table SET $changes WHERE $this->primaryKey = ?")
      ->execute(params: $values);
  }

  public function delete($id): bool
  {
    return $this
      ->connect()
      ->prepare(query: "DELETE FROM $this->table WHERE $this->primaryKey = ?")
      ->execute(params: [$id]);
  }

  public function close(): void
  {
    $this->dbh = null;
  }
}