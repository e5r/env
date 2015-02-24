// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

// NOTE: Based on https://github.com/hakobera/nvmw/blob/master/fget.js
//       and https://gist.github.com/udawtr/2053179
(function(){ 'use strict'
  var fs = sys.require('fsutils.js');

  /**
   * Get a Web file.
   *
   * @param {string}    url       The URL of resource
   * @param {string}    filePath  The local path to save file
   * @param {callback}  cbkError  Callback to execute if error ocurred
   *
   * @return TRUE if file is downloaded, FALSE if not
   */
  function _getFile(url, filePath, cbkError){
    var _filePath = fs.absolutePath(filePath),
        _directoryPath = fs.getDirectoryPath(filePath),
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
            if(!fs.directoryExists(_directoryPath)){
              fs.createDirectory(_directoryPath);
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
      WScript.Sleep(1000);
    }
    _http = null;
    _stream = null;
    return !_error;
  }

  module.exports = {
    getFile: _getFile
  }
})();
