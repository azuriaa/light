<?php

namespace Controllers;

use Libraries\Controller;

class Home extends Controller
{
  public function index(): void
  {
    echo $this->view('hello_world');
  }
}
