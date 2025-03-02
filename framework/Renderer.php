<?php

namespace Framework;

class Renderer
{
  protected array $data;
  protected string $viewPath;
  protected string $file;

  public function setup(string $viewPath, string $file, array $data = []): self
  {
    $this->viewPath = $viewPath;
    $this->file = $file;
    $this->data = $data;

    return $this;
  }

  public function render(): void
  {
    if (file_exists(filename: $this->viewPath . $this->file . '.php')) {
      extract($this->data);
      require_once "$this->viewPath/$this->file.php";
    } elseif (file_exists(filename: "$this->viewPath/$this->file.html")) {
      $view = file_get_contents(filename: "$this->viewPath/$this->file.html");
      $keys = array_keys($this->data);
      foreach ($keys as $key) {
        if (is_array(value: $this->data[$key])) {
          $this->data[$key] = json_encode(value: $this->data[$key]);
        }

        $view = str_replace(search: "{{ $key }}", replace: $this->data[$key], subject: $view);
      }

      echo $view;
    } else {
      throw new \Exception(message: "File $this->file.php or $this->file.html does not exist.");
    }
  }
}