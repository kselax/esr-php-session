/*
  esr-php-session is an app for creating session with php, express, socket.io
   Copyright (C) 2018  Hacker Kselax

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
const crypto = require('crypto');
const debug = require('debug')('express-session');
const debug1 = require('debug')('socket-io-session');
var redis = require("redis"),
    client = redis.createClient();

function express_session(options){
  var options = options || {};

  return function(req, res, next){
    // initialization variables
    req.esr_php_session = {}
    var esr_php_session_name = options.esr_php_session_name || 'esr_php_session';
    var secret = options.secret || 'secret key';
    var maxAge = (options.maxAge * 1000) || 86400000; // by defult 24 hours
    var ex = options.ex || 60;

    // create a listener on writeHead
    res.writeHead = createWriteHead(res.writeHead);
    function createWriteHead(prevWriteHead){
      return function(){
        var data = esr_php_session_name + '=' + req.esr_php_session.esr_id + '; Max-Age=' + Math.floor(maxAge/1000) + '; Path=/; Expires=' + new Date(new Date().getTime() + maxAge/1000).toGMTString() + '; HttpOnly';
        var prev = res.getHeader('set-cookie') || [];
        debug('prev = ' + prev);
        var cookies = '';
        if(Array.isArray(prev)){
          cookies = prev.concat(data);
        }else{
          cookies = [prev, data];
        }
        debug('cookies = ', cookies);
        res.setHeader('Set-Cookie', cookies);
        // save to database
        client.set('sess:' + req.esr_php_session.esr_id, JSON.stringify(req.esr_php_session), 'EX', ex);
        prevWriteHead.apply(this, arguments);
      }
    } // function createWriteHead(prevWriteHead){

    debug('req.headers.cookie = ' + req.headers.cookie);
    if(req.headers.cookie){
      var result = req.headers.cookie.match(new RegExp(esr_php_session_name + '=([^; ]*)', 'i'));
      if(result !== null){
        req.esr_php_session.esr_id = result[1];
        // promise
        let promise = function(req){
          return new Promise((resolve, reject) => {
            client.get('sess:' + req.esr_php_session.esr_id, function(err, reply) {
              resolve(reply);
            });
          })
        }
        var db = promise(req);
        db.then((successMessage) => {
          // debug('successMessage = ' + successMessage);
          if(successMessage !== null){
            debug('successMessage != null ', successMessage);
            req.esr_php_session = JSON.parse(successMessage);
            next();
          }else{
            req.esr_php_session.esr_id = generate_new_session();
            next();
          }
        });
      }else{ // result is null and generate a new session
        req.esr_php_session.esr_id = generate_new_session();
        next();
      }
    }else{
      debug('generate a new session');
      req.esr_php_session.esr_id = generate_new_session();
      debug('new session esr_id = ', req.esr_php_session.esr_id);
      next();
    }
    // helper functions
    function generate_new_session(){
      var current_date = (new Date()).valueOf().toString();
      var random = Math.random().toString();
      return crypto.createHash('sha256').update(current_date + random + secret).digest('hex');
    }
  } // return function(req, res, next){
}

module.exports.express_session = express_session;

function socket_io_session(options){
  var options = options || {};
  return function(socket, next){
    // initialization
    socket.esr_php_session = {};
    var esr_php_session_name = options.esr_php_session_name || 'esr_php_session';
    var secret = options.secret || 'secret key';
    var maxAge = options.maxAge || 86400000;
    var ex = options.ex || 60;

    debug1(socket.handshake.headers.cookie);
    if(socket.handshake.headers.cookie){
      var result = socket.handshake.headers.cookie.match(new RegExp(esr_php_session_name + '=([^; ]*)', 'i'));
      debug1('result = ', result);
      if(result !== null){
        socket.esr_php_session.esr_id = result[1];
        // promise
        let promise = function(socket){
          return new Promise((resolve, reject) => {
            client.get('sess:' + socket.esr_php_session.esr_id, function(err, reply) {
              resolve(reply);
            });
          })
        }
        var db = promise(socket);
        db.then((successMessage) => {
          // debug('successMessage = ' + successMessage);
          if(successMessage !== null){
            debug1('successMessage != null ', successMessage);
            socket.esr_php_session = JSON.parse(successMessage);
            socket.esr_php_session.save = save;
            next();
          }else{
            socket.esr_php_session = null;
            next();
          }
        });
      }else{ // result is null and generate a new session
        socket.esr_php_session = null;
        next();
      }
    }else{ // if(socket.handshake.headers.cookie){
      socket.esr_php_session = null;
      next();
    }

    function save(){
      debug1('save = ', this);
      // save to database
      client.set('sess:' + this.esr_id, JSON.stringify(this), 'EX', ex);
    }

  } // return function(socket, next){
} // function socket_io_session(options){

module.exports.socket_io_session = socket_io_session;
