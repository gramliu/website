<?php
$debugPath = "/";
$DEBUG = false;
$request = $DEBUG ? $debugPath : $_SERVER["REDIRECT_URL"];

switch ($request) {
    case '/':
        require __DIR__ . '/index.html';
        break;
    case '':
        require __DIR__ . '/index.html';
        break;
    case '/about':
        require __DIR__ . '/views/404.html';
        break;
    default:
        require __DIR__ . '/views/404.html';
        break;
}
