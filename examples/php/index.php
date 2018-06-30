<?php
require_once 'Esr_php_session.php';

$obj = new Esr_php_session(array(
  'esr_php_session_name' => 'my_session',
  'secret' => 'my new secret',
  'maxAge' => (60 * 60 * 24), // by default 24 hours
  'EX' => 60,
));

// count views
if(is_numeric($_COOKIE['esr_php_session']['views'])){
  $_COOKIE['esr_php_session']['views']++;
}else{
  $_COOKIE['esr_php_session']['views'] = 0;
}
echo 'Views = ' . $_COOKIE['esr_php_session']['views'] . "\n";

// save and set up cookies
$obj->save(); // save session to database

?>
