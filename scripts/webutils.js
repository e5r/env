// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(_){ 'use strict'
  _.fs = sys.require('fsutils.js');
  _.su = sys.require('sysutils.js');

  /**
   * Get a Web file.
   *
   * @param {string}    url       The URL of resource
   * @param {string}    filePath  The local path to save file
   * @param {callback}  cbkError  Callback to execute if error ocurred
   *
   * @return TRUE if file is downloaded, FALSE if not
   */
  _.getFile = function(){
    var url, filePath, cbkError;

    if(arguments.length < 1){
      throw new Error('<webutils.getFile> #ArgumentException: @url is required.');
    }

    url = arguments[0];

    if(arguments.length > 2 || (arguments.length == 2 && typeof arguments[1] == 'string')){
      filePath = arguments[1];
    }else{
      var _urlParts = url.split('/');
      filePath = _urlParts[_urlParts.length - 1];
    }

    if(arguments.length > 2 || (arguments.length == 2 && typeof arguments[1] == 'function')){
      cbkError = arguments[arguments.length > 2 ? 2 : 1];
    }else{
      cbkError = function(error){
        throw new Error('<webutils.getFile> #' + error.name + ': ' + error.message);
      };
    }

    if(typeof filePath != 'string'){
      throw new Error('<webutils.getFile> #ArgumentException: @filePath type is invalid.');
    }

    if(typeof cbkError != 'function'){
      throw new Error('<webutils.getFile> #ArgumentException: @cbkError type is invalid.');
    }

    var _filePath = _.fs.absolutePath(filePath),
        _directoryPath = _.fs.getDirectoryPath(filePath),
        _http = new ActiveXObject('MSXML2.ServerXMLHTTP'),
        _stream = new ActiveXObject("ADODB.Stream")
        _completed = false,
        _error = false;

    _http.onreadystatechange = function() {
      try{
        if(_http.readyState === 4){
          if(_http.status === 200){
            _stream.type = 1;
            _stream.open();
            if(_http.responseText){
              _stream.write(_http.responseBody);
            }
            if(!_.fs.directoryExists(_directoryPath)){
              _.fs.createDirectory(_directoryPath);
            }
            _stream.savetofile(_filePath, 2);
          }else{
            _error = true;
            cbkError(new Error(_http.status + ' ' + _http.statusText));
          }
          _completed = true;
        }
      }catch(error){
        _error = true;
        _completed = true;
        cbkError(error);
      }
    }

    try {
      _http.open('GET', url, true);
      _http.send(null);
    }catch(error){
      _error = true;
      _completed = true;
      _http.abort();
      cbkError(error);
    }

    while(!_completed){
      _.su.sleep(100);
    }

    _http = null;
    _stream = null;
    return !_error;
  }

  module.exports = {
    download: _.getFile
  }
})({});
