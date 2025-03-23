<?php

namespace App\Controllers;

use Framework\Controller;

class Home extends Controller
{
    public function index(): void
    {
        view('home');
    }
}
