<?php

namespace Framework;

use Framework\Request;
use Framework\Response;

abstract class Controller
{
    protected Request $request;
    protected Response $response;

    public function __construct()
    {
        $this->request = new Request;
        $this->response = new Response;
    }
}
