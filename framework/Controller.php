<?php

namespace Framework;

use Framework\Request;
use Framework\Response;
use Framework\Renderer;
use Framework\Singleton;
use Framework\Model;

abstract class Controller
{
    protected Request $request;
    protected Response $response;

    public function __construct()
    {
        $this->request = new Request;
        $this->response = new Response;
    }

    public function view(string $file, array $data = []): void
    {
        $renderer = Singleton::mount(service: Renderer::class);
        $renderer->setup(viewPath: VIEWPATH, file: $file, data: $data)->render();
    }

    public function model($model): Model
    {
        return Singleton::mount(service: $model);
    }
}