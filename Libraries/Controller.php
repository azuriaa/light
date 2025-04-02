<?php

namespace Libraries;

use Libraries\Request;
use Libraries\Response;
use Libraries\Renderer;
use Libraries\Validator;

abstract class Controller
{
  protected Request $request;
  protected Response $response;
  protected Validator $validator;

  public function __construct()
  {
    $this->request = new Request;
    $this->response = new Response;
    $this->validator = new Validator;
  }

  public function view(string $file, array $data = [], $path = ROOTPATH . 'Views/'): string
  {
    return (new Renderer)
      ->setup($path, $file, $data)
      ->render();
  }
}
