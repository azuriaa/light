<?php

namespace Libraries;

use Libraries\Request;
use Libraries\Response;
use Libraries\Renderer;
use Libraries\Validator;
use Libraries\Upload;
use Libraries\Singleton;

abstract class Controller
{
  protected Request $request;
  protected Response $response;
  protected Validator $validator;
  protected Upload $upload;

  public function __construct()
  {
    $this->request = Singleton::mount(Request::class);
    $this->response = Singleton::mount(Response::class);
    $this->validator = Singleton::mount(Validator::class);
    $this->upload = Singleton::mount(Upload::class);
  }

  protected function view(string $file, array $data = [], $path = ROOTPATH . 'Views/'): string
  {
    $renderer = Singleton::mount(Renderer::class);
    return $renderer
      ->setup($path, $file, $data)
      ->render();
  }
}
