<?php
include("../auth.php");
$host = "gramliu.com";
$db = "gramliuc_env_ph";
$tdata = "sensor_data";
$tloc = "sensor_map";

$credentials = getDBCredentials();
$user = $credentials["user"];
$pw = $credentials["password"];

$mysqli = initDB();

// TODO: Escape strings to prevent SQL injection
if (isset($_GET["action"])) {
    $action = $_GET["action"];

    if ($action == "data") {
        // Data packets
        $src_id = $_GET["src_id"];
        $entry_id = $_GET["entry_id"];
        $entry_time = $_GET["entry_time"];
        $pm1 = $_GET["pm1"];
        $pm2_5 = $_GET["pm2_5"];
        $pm10 = $_GET["pm10"];
        $humidity = $_GET["humidity"];
        $temperature = $_GET["temperature"];
        $carbon_dioxide = $_GET["carbon_dioxide"];
        $carbon_monoxide = $_GET["carbon_monoxide"];

        $sql_data = "INSERT INTO $tdata
        (src_id, entry_id, entry_time, pm1, pm2_5, pm10, humidity, temperature, carbon_dioxide, carbon_monoxide)
        VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
        )";
        $stmt = $mysqli->prepare($sql_data);
        $stmt->bind_param("iisddddddd", $src_id, $entry_id, $entry_time, $pm1, $pm2_5, $pm10,
         $humidity, $temperature, $carbon_dioxide, $carbon_monoxide);
        $res = $stmt->execute();
        if (!$res) {
            echo $stmt->error;
        }
        $stmt->close();

        $sql_update = "UPDATE $tloc
        SET last_update = CASE
            WHEN last_update < ? THEN ?
            ELSE last_update
        END,
        last_entry_id = CASE
            WHEN last_entry_id < ? THEN ?
            ELSE last_entry_id
        END";

        $stmt = $mysqli->prepare($sql_update);
        $stmt->bind_param("ssii", $entry_time, $entry_time, $entry_id, $entry_id);
        $res = $stmt->execute();    
        if (!$res) {
            echo $stmt->error;
        }
        $stmt->close();
    } else if ($action == "register") {
        // Register new module
        $src_id = $_GET["src_id"];
        $location_name = $_GET["location_name"];
        $latitude = $_GET["latitude"];
        $longitude = $_GET["longitude"];
        $last_update = 0;
        $last_entry_id = 0;

        if (isset($_GET["last_update"])) {
            $last_update = $_GET["last_update"];
        }
        if (isset($_GET["last_entry_id"])) {
            $last_entry_id = $_GET["last_entry_id"];
        }

        $sql = "INSERT INTO $tloc
        (src_id, location_name, latitude, longitude, creation_time, last_update, last_entry_id)
        VALUES (
            ?,
            ?,
            ?,
            ?,
            NOW(),
            ?,
            ?
        )";
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("isddsi", $src_id, $location_name, $latitude, $longitude, $last_update, $last_entry_id);
        $res = $stmt->execute();
        if (!$res) {
            echo $stmt->error;
        }
        $stmt->close();
    } else if ($action == "query_data") {
        // Data queries
        $src_id = $_GET["src_id"];
        $ref_time = $_GET["timestamp"];

        $sql_arr = array();
        // $sql_arr[] = "SELECT entry_time, pm1, pm2_5, pm10, 
        // humidity, temperature, carbon_dioxide, carbon_monoxide
        // FROM sensor_data data
        // WHERE data.entry_id = (
        //     SELECT last_entry_id
        //     FROM sensor_map
        //     WHERE src_id=?
        // )";
        $sql_arr[] = "SELECT entry_time, pm1, pm2_5, pm10, 
        humidity, temperature, carbon_dioxide, carbon_monoxide
        FROM $tdata
        WHERE src_id=? AND
            entry_time <= ?
        ORDER BY entry_time DESC
        LIMIT 1";
        $sql_arr[] = "SELECT entry_time,
                    AVG(pm1),
                    AVG(pm2_5),
                    AVG(pm10),
                    AVG(humidity),
                    AVG(temperature),
                    AVG(carbon_dioxide),
                    AVG(carbon_monoxide)
                FROM $tdata
                WHERE src_id=? AND
                    entry_time >= ? - INTERVAL 24 HOUR
                GROUP BY HOUR(entry_time)";
        $sql_arr[] = "SELECT entry_time,
                    AVG(pm1),
                    AVG(pm2_5),
                    AVG(pm10),
                    AVG(humidity),
                    AVG(temperature),
                    AVG(carbon_dioxide),
                    AVG(carbon_monoxide)
                FROM $tdata
                WHERE src_id=? AND
                    entry_time >= ? - INTERVAL 7 DAY
                GROUP BY DAY(entry_time)";
        $sql_arr[] = "SELECT entry_time,
                    AVG(pm1),
                    AVG(pm2_5),
                    AVG(pm10),
                    AVG(humidity),
                    AVG(temperature),
                    AVG(carbon_dioxide),
                    AVG(carbon_monoxide)
                FROM $tdata
                WHERE src_id=? AND
                    entry_time >= ? - INTERVAL 4 WEEK
                GROUP BY WEEK(entry_time)";
        $sql_arr[] = "SELECT entry_time,
                AVG(pm1),
                AVG(pm2_5),
                AVG(pm10),
                AVG(humidity),
                AVG(temperature),
                AVG(carbon_dioxide),
                AVG(carbon_monoxide)
            FROM $tdata
            WHERE src_id=? AND
                entry_time >= ? - INTERVAL 12 MONTH
            GROUP BY MONTH(entry_time)";
        
        $limits = array(1, 24, 7, 4, 12);
        $time_labels = array("latest", "day", "week", "month", "year");
        $data_labels = array("entry_time", "pm1", "pm2_5", "pm10",
        "humidity", "temperature", "carbon_dioxide", "carbon_monoxide");
        $output = array();
        for ($i = 0; $i < sizeof($sql_arr); $i++) {
            $sql = $sql_arr[$i];
            $stmt = $mysqli->prepare($sql);

            $stmt->bind_param("is", $src_id, $ref_time);
            $stmt->execute();

            $result = $stmt->get_result();
            $unit = array();

            for ($count = 0; $count < $limits[$i]; $count++) {
                $tmp = array();
                if ($row = $result->fetch_array()) {
                    for ($j = 0; $j < sizeof($data_labels); $j++) {
                        $tmp[$data_labels[$j]] = $row[$j];
                    }
                } else {
                    for ($j = 0; $j < sizeof($data_labels); $j++) {
                        $tmp[$data_labels[$j]] = 0;
                    }
                }
                $unit[$count] = $tmp;
            }
            $output[$time_labels[$i]] = $unit;
            $stmt->close();
        }
        $json = json_encode($output);
        header('Content-type:application/json');
        echo $json;
    } else if ($action == "query_sensor") {
    }
}

function initDB()
{
    global $host, $user, $pw, $db, $tdata, $tloc;
    $sql_data = "CREATE TABLE IF NOT EXISTS $tdata (
            src_id int(10),
            entry_id int(10),
            entry_time timestamp NOT NULL DEFAULT NOW(),
            pm1 double(6, 2),
            pm2_5 double(6, 2),
            pm10 double(6, 2),
            humidity double(6, 2),
            temperature double(6, 2),
            carbon_dioxide double(6, 2),
            carbon_monoxide double(6, 2)
        )";
    $sql_map = "CREATE TABLE IF NOT EXISTS $tloc (
            src_id int(10) UNIQUE,
            location_name varchar(64),
            latitude double(9, 5),
            longitude double(9, 5),
            creation_time timestamp NOT NULL,
            last_update timestamp NOT NULL,
            last_entry_id int(10)
        )";
    $mysqli = new mysqli($host, $user, $pw, $db);
    if ($mysqli->connect_error) {
        die("Failed to connect to server.");
    } else {
        $stmt = $mysqli->prepare($sql_data);
        $stmt->execute();
        $stmt->close();
        $stmt = $mysqli->prepare($sql_map);
        $stmt->execute();
        $stmt->close();
        return $mysqli;
    }
}
