<?php

namespace App\Controllers;

use Framework\Controller;

class Home extends Controller
{
    public function index(): void
    {
        $this->view(file: 'home');
    }
}