<?php
//sleep(1);
$arr = array(
	array("id"=>1,
	"name"=>"语文"),
	array("id"=>2,
	"name"=>"数学"),
	array("id"=>"",
	"name"=>"英语")
);
echo json_encode($arr);
//echo json_encode(array());
?>