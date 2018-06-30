esr-php-session
===============

A [esr-php-session][] is a session for `express`, `socket.io`, `php`, which doesn't suck to work together with `Redis` as a database.

Authors: Neo he is notoriously known in runet as Hacker Kselax Here is his [home page] to visit

[![npm version][npm-badge]][npm]
[![dependency status][dep-badge]][dep-status]

[npm]: https://www.npmjs.org/package/esr-php-session
[npm-badge]: https://img.shields.io/npm/v/esr-php-session.svg?style=flat-square
[dep-status]: https://david-dm.org/ericf/esr-php-session
[dep-badge]: https://img.shields.io/david/ericf/esr-php-session.svg?style=flat-square
[home page]: https://kselax.ru/en/

## Goals & Design
I built this package out of frustrations of existing packages `express-session`, `connect-redis`, `express-socket.io-session`. This three doesn't work properly together with redis database. and We can't find the package that allows working with php.

So this simple package was designed to work with sessions using Redis as database three express + socket.io + php. You can use them all together or for each separately

## Installation
```shell
$ npm install esr-php-session --save
```
## Before usage important to know
**for session works properly with php+socket.io+express you have to specify the same name in any initialization this option `esr_php_session_name: 'my_session',` should be equal otherwise they can't work simultaneously and to know each other**

## Usage with express and socket.io
Include to file
```javascript
var esr_php_session = require('./esr-php-session/esr-php-session');
```
in middlewire add this lines

**For using with `express`**
```javascript
app.use(esr_php_session.express_session({
  esr_php_session_name: 'my_session',
  secret: 'my new secret',
  maxAge: (60 * 60 * 24), // by default 24 hours
  EX: 60,
}));
```
then you can put variables to `res.esr_php_session`
something like `res.esr_php_session = some_value` and this value will saved and will available on next reload page.

**For using with `socket.io`**
```javascript
io.use(esr_php_session.socket_io_session({
  esr_php_session_name: 'my_session',
  secret: 'my new secret',
  maxAge: (60 * 60 * 24), // by default 24 hours
  EX: 60,
}));
```
now for you available `socket.esr_php_session` and you can put there some variable like `socket.esr_php_session.views = 30`


## Usage with php
at first find file `Esr_php_session.php` and include it to your php project
```php
require_once 'Esr_php_session.php';
```
then create a object
```php
$obj = new Esr_php_session(array(
  'esr_php_session_name' => 'my_session',
  'secret' => 'my new secret',
  'maxAge' => (60 * 60 * 24), // by default 24 hours
  'EX' => 60,
));
```
that's it, when you create object in this time will be automatically added to `$_COOKIE` a new variable with name of your session `$_COOKIE[esr_php_session_name]`

## Example with express
```javascript
const express = require('express');
const esr_php_session = require('esr_php_session');
var app = express();
app.listen(3000);

app.use(esr_php_session.express_session({
  esr_php_session_name: 'my_session',
  secret: 'my new secret',
  maxAge: (60 * 60 * 24), // by default 24 hours
  EX: 60,
}));

app.get('/', function(req, res){
  console.log(req.esr_php_session.views);
  if(req.esr_php_session.views || req.esr_php_session.views == 0){
    req.esr_php_session.views++;
  }else{
    req.esr_php_session.views = 0;
  }
  console.log('req.esr_php_session.views = ', req.esr_php_session.views);
  res.send('Views = ' + req.esr_php_session.views);
});
```
## Example with socket.io
```javascript
...
io.use(esr_php_session.socket_io_session({
  esr_php_session_name: 'my_session',
  secret: 'my new secret',
  maxAge: (60 * 60 * 24), // by default 24 hours
  EX: 60,
}));

io.on('connection', function(socket){

  console.log('connected socket.id = ' + socket.id);

  if(socket.esr_php_session){
    if(socket.esr_php_session.views){
      socket.emit('message', socket.esr_php_session.views);
    }else{
      socket.esr_php_session.views = 0;
      socket.emit('message', socket.esr_php_session.views);
    }
  }
  console.log(socket.esr_php_session.views);
}
```

## More examples
See on github in folder examples or inside package in `/node_modules/esr-php-session/examples`


## License
This software is free to use under GNU General Public License GPL. See the [license description][] for license text and copyright information.


[license description]: https://www.gnu.org/licenses/gpl-3.0-standalone.html
