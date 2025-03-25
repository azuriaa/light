<?php

namespace App\Controllers;

class Home
{
    public function index(): void
    {
        $data = [
            'title' => 'Counter Example',
        ];

        echo view('home', $data);
    }
}
