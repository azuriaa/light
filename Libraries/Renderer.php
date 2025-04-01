<?php

namespace Libraries;

class Renderer
{
  protected array $data;
  protected string $viewPath;
  protected string $file;
  protected string $view;

  public function setup(string $viewPath, string $file, array $data = []): self
  {
    $this->viewPath = $viewPath;
    $this->file = $file;
    $this->data = $data;

    return $this;
  }

  public function render(): string
  {
    if (file_exists("$this->viewPath/$this->file.php")) {
      ob_start();

      extract($this->data);
      include "$this->viewPath/$this->file.php";

      $this->view = ob_get_clean();
    } else {
      throw new \Exception("File $this->file.php or $this->file.html does not exist.");
    }

    return $this->view;
  }
}
