<?php
$key = "ThVSX0P2yoG+PoykNiV2F/mL4Mzs2f5fJU2m29vNUJM=";
$url = dirname($_SERVER["DOCUMENT_ROOT"])."/credentials/db.cfg";

function encrypt($data) {
    global $key;
    $encryption_key = base64_decode($key);
    $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));
    $encrypted = openssl_encrypt($data, 'aes-256-cbc', $encryption_key, 0, $iv);
    return base64_encode($encrypted . '::' . $iv);
}

function decrypt($data) {
    global $key;
    $encryption_key = base64_decode($key);
    list($encrypted_data, $iv) = explode('::', base64_decode($data), 2);
    return openssl_decrypt($encrypted_data, 'aes-256-cbc', $encryption_key, 0, $iv);
}

function getDBCredentials() {
    global $url;
    if ($file = fopen($url, "r")) {
        $jstr = "";
        while (!feof($file)) {
            $line = fgets($file);
            $jstr .= $line;
        }
        fclose($file);
        $jstr = decrypt(base64_decode($jstr));
        return json_decode($jstr, true);
    }
    return null;
}