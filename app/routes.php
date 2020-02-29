<?php
$app->get("/", function($req, $res) {
    $res = $this->view->render($res, "home.html");
    return $res;
});

$app->get("/resume", function($req, $res) {
    $path = "../assets/raw/Resume.pdf";
    $res["Content-Length"] = filesize($path);
    $res["Content-Type"] = "application/pdf";
    $res["Content-Disposition"] ="inline; filename=" . basename($path);
    $res["Expires"] = "0";
    $res["Cache-Control"] = "must-revalidate, post-check=0, pre-check=0";
});

$app->get("/cv", function($req, $res) {
    $path = "../assets/raw/CV.pdf";
    $res["Content-Length"] = filesize($path);
    $res["Content-Type"] = "application/pdf";
    $res["Content-Disposition"] ="inline; filename=" . basename($path);
    $res["Expires"] = "0";
    $res["Cache-Control"] = "must-revalidate, post-check=0, pre-check=0";
});