<?php
if(!class_exists('Esr_php_session')){
  class Esr_php_session{
    private $redis = '';
    private $esr_php_session_name = '';
    private $secret = '';
    private $ex = '60';

    public function __construct($args){
      $this->esr_php_session_name = $args['esr_php_session_name'];
      $this->ex = $args['EX'];
      $this->secret = $args['secret'];
      $this->maxAge = $args['maxAge'];

      $this->redis = new Redis();
      $this->redis->connect('127.0.0.1', 6379);

      if($res = $this->redis->get('sess:'.$_COOKIE[$args['esr_php_session_name']])){
        $_COOKIE['esr_php_session'] = json_decode($res, 'assoc');
      }else{
        $_COOKIE['esr_php_session'] = null;
      }
    }

    public function save(){
      if($_COOKIE['esr_php_session'] != null && $_COOKIE['esr_php_session']['esr_id'] != null){
        $this->set_cookie_and_save_session();
      }else if($_COOKIE['esr_php_session'] != null){
        $_COOKIE['esr_php_session']['esr_id'] = $this->generate_new_session();
        $this->set_cookie_and_save_session();
      }
    }

    // helper functions
    private function generate_new_session(){
      $current_date = time();
      $random = (string)rand ( 9999999999 , 999999999999 );
      $randomString = $current_date . $random;
      return hash('sha256', $randomString);
    }

    private function set_cookie_and_save_session(){
      setcookie($this->esr_php_session_name, $_COOKIE['esr_php_session']['esr_id'], time()+$this->maxAge);
      $this->redis->set('sess:'.$_COOKIE['esr_php_session']['esr_id'], json_encode($_COOKIE['esr_php_session']), $this->ex);
    }
  }
}

?>
