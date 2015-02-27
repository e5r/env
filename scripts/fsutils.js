// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(){ 'use strict'
  var _fso = new ActiveXObject("Scripting.FileSystemObject"),
      _consts = {
        // SpecialFolder Bit's
        SF_WINDOWS: 0,
        SF_SYSTEM: 1,
        SF_TEMP: 2
      };

  /**
   * Get path to a special directory in system.
   *
   * @param {int} bit _consts SF_X value
   *
   * @return Path to a special directory
   */
  function _getSpecialDirectory(bit){
    if(bit != _consts.SF_WINDOWS && bit != _consts.SF_SYSTEM && bit != _consts.SF_TEMP){
      throw new Error('Invalid bit to Special Folder.');
    }
    return _fso.GetSpecialFolder(bit);
  }

  /**
   * Generate a temporary file name.
   *
   * @return Path to a temporary file
   */
  function _getTempFileName(){
    var _tempPath = _getSpecialPath(_consts.SF_TEMP);
    var _tempName = _fso.GetTempName();
    return _tempPath + _tempName;
  }

  /**
   * Verify path correspond to a exist file.
   *
   * @param {string} path Path to a file
   *
   * @return TRUE if exists or FALSE if not exists
   */
  function _fileExists(path){
    var _path = _absolutePath(path);
    return _fso.FileExists(_path);
  }

  /**
   * Verify path correspond to a exist directory.
   *
   * @param {string} path Path to a directory
   *
   * @return TRUE if exists or FALSE if not exists
   */
  function _directoryExists(path){
    var _path = _absolutePath(path);
    return _fso.FolderExists(_path);
  }

  /**
   * Create a directory
   *
   * @param {string} path Directory path to create
   *
   * @return Absolute path to directory created, or undefined if
   *         not created
   */
  function _createDirectory(path){
    var _path = _absolutePath(path),
        _parent = _getDirectoryPath(_path);
    if(_parent && !_directoryExists(_parent)){
      _createDirectory(_parent);
    }
    if(!_directoryExists(_path)){
      _fso.CreateFolder(_path);
    }
    return _path;
  }

  /**
   * Generate absolute path from relative path.
   * TODO: Rename to _fullPath
   *
   * @param {string} path Relative path to generate
   *
   * @return Absolute path
   */
  function _absolutePath(path){
    return _fso.GetAbsolutePathName(path);
  }

  /**
   * Make path for many parts
   *
   * @param {string} arg[0] Path base
   * @param {string} arg[n] Path to add in base
   *
   * @return Path combined
   */
  function _combinePath(){
    if(arguments.length < 1) return;
    var _path = _absolutePath(arguments[0]);
    for(var arg = 1; arg < arguments.length; arg++){
      _path = _fso.BuildPath(_path, arguments[arg].replace('/','\\'));
    }
    return _path;
  }

  /**
   * Make a directory path.
   *
   * @param {string} path Path to a file or directory
   *
   * @return Full path to a last directory
   */
  function _getDirectoryPath(path){
    var _path = _absolutePath(path);
    return _fso.GetParentFolderName(_path);
  }

  /**
   * Create a new Text file
   *
   * @param {string}  path      Path to file
   * @param {bool}    overwrite If can overwrite an existing file
   * @param {bool}    unicode   If file is created as a Unicode or ASCII
   *
   * @return TextStream object
   */
  function _createTextFile(path, overwrite, unicode){
    overwrite = overwrite || false;
    unicode = unicode || false;
    return _fso.CreateTextFile(_absolutePath(path), overwrite, unicode);
  }

  /**
   * Read content of text file
   *
   * @param {string} path   Path to file
   *
   * @return String with content file
   */
  function _getTextFileContent(path){
    return _fso.OpenTextFile(_absolutePath(path), 1).ReadAll();
  }

  /**
   * Read content of text file
   *
   * @param {string} path   Path to file
   *
   * @return Array with lines of content file
   */
  function _getArrayFileContent(path){
    var _file = _fso.OpenTextFile(this.absolutePath(path), 1),
        _content = [];
    while(!_file.AtEndOfStream)
      _content.push(_file.ReadLine());
    _file.Close();
    return _content;
  }

  /**
   * Remove the file
   *
   * @param {string} path Path to file
   */
  function _deleteFile(path){
    _fso.DeleteFile(_absolutePath(path));
  }

  module.exports = {
    CONST: _consts,
    fileExists: _fileExists,
    directoryExists: _directoryExists,
    createDirectory: _createDirectory,
    createTextFile: _createTextFile,
    deleteFile: _deleteFile,
    getTextFileContent:_getTextFileContent,
    getArrayFileContent:_getArrayFileContent,
    getSpecialDirectory: _getSpecialDirectory,
    getTempFileName: _getTempFileName,
    getDirectoryPath: _getDirectoryPath,
    absolutePath: _absolutePath,
    combine: _combinePath
  }
})();
