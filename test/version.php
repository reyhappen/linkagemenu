<?php
sleep(2);
@$name = urldecode(isset($_GET['subject']) ? $_GET['subject'] : $_GET['detail']);
$arr=array();
for($i=0;$i<100;$i++){
	array_push($arr, array('id'=>$i, 'name'=>$name.$i."册"));
}
echo json_encode($arr);
?>