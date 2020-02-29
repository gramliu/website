<?php
require_once __DIR__ . "/../vendor/autoload.php";
$dotenv = Dotenv\Dotenv::create(__DIR__ . "/../");
if (file_exists(__DIR__ . "/../.env")) {
    $dotenv->load();
}

$config["displayErrorDetails"] = true;
$config["addContentLengthHeader"] = false;
$config["settings"] = [
        "determineRouteBeforeAppMiddleware" => true,
        "displayErrorDetails" => isset($_ENV["ENVIRONMENT"]) && $_ENV["ENVIRONMENT"] !== "production",
];

$container = new \Slim\Container($config);

$container["logger"] = function($c) {
    $logger = new \Monolog\Logger("my_logger");
    $file_handler = new \Monolog\Handler\StreamHandler("logs/app.log");
    $logger->pushHandler($file_handler);
    return $logger;
};

$container["view"] = new \Slim\Views\PhpRenderer("views/");

$container["notFoundHandler"] = function ($container) {
    return function ($req, $res) use ($container) {
        return $response->withStatus(404)
        ->withHeader('Content-Type', 'text/html')
        ->write('Page not found');
    };
};

$container["errorHandler"] = function ($container) {
    return function ($req, $res, $e) use ($container) {
        $this->logger->error($e);

        return $response->withStatus(500)
        ->withHeader('Content-Type', 'text/html')
        ->write('Internal server error occured');
    };
};

$app = new \Slim\App($container);

$app->options("/{routes:.+}", function ($request, $response, $args) {
    return $response;
});

$app->add(function ($req, $res, $next) {
    $response = $next($req, $res);
    return $response
        ->withHeader("Access-Control-Allow-Origin", "*")
        ->withHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept, Origin, Authorization")
        ->withHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
});

require_once "routes.php";