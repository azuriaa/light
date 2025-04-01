<?php

namespace Controllers;

use Libraries\Controller;

class Home extends Controller
{
    public function index(): void
    {
        $data = [
            'title' => 'Counter Example',
        ];

        echo $this->view('home', $data);
    }
}
