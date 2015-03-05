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
   * Create a new Text file and fill content.
   *
   * @param {string}  path          Path to file
   * @param {string|array} content  Content file
   * @param {bool}    overwrite     If can overwrite an existing file
   * @param {bool}    unicode       If file is created as a Unicode or ASCII
   */
  function _createTextFileWithContent(path, content, overwrite, unicode){
    var _file = _createTextFile(path, overwrite, unicode);
    if(typeof content === typeof ''){
      _file.Write(content);
    }
    if(Array.isArray(content)){
      for(var _l in content) _file.WriteLine(content[_l]);
    }
    _file.Close();
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

  /**
   * Remove the folder with all content
   *
   * @param {string} path Path to directory
   */
  function _deleteDirectory(path){
    _fso.DeleteFolder(_absolutePath(path));
  }

  /**
   * Return a items (files and subdirectorys) of directory
   *
   * @param {string} path Path to directory
   *
   * @return Array of {type(file|directory), path} items
   */
  function _getDirectoryItems(path, matchRegex){
    var _path = _absolutePath(path),
        _items = [],
        _match = RegExp.prototype.isPrototypeOf(matchRegex) ? matchRegex : /./g,
        _directory,
        _folderIterator,
        _fileIterator;

    if(!_directoryExists(_path))
      throw new Error('Directory [' + _path + '] not exists');

    _directory = _fso.GetFolder(_path);

    // Get subfolders
    _folderIterator = new Enumerator(_directory.SubFolders);
    while(!_folderIterator.atEnd())
    {
      _itemPath = '.'.replace('.', _folderIterator.item());
      if(_itemPath.search(_match) >= 0){
        _items.push({type:'directory', path: _itemPath});
      }
      _folderIterator.moveNext();
    }

    // Get files
    _fileIterator = new Enumerator(_directory.Files);
    while(!_fileIterator.atEnd())
    {
      _itemPath = '.'.replace('.', _fileIterator.item());
      if(_itemPath.search(_match) >= 0){
        _items.push({type:'file', path: _itemPath});
      }
      _fileIterator.moveNext();
    }

    return _items;
  }

  /**
   * Copy a directory content to a destination path
   *
   * @param {string} source       Path to origin directory
   * @param {string} destination  Path to destination directory
   */
  function _copyDirectory(source, destination){
    _fso.CopyFolder(source, _absolutePath(destination));
  }

  /**
   * Copy a file to a destination path
   *
   * @param {string}  source      Path to origin file
   * @param {string}  destination Path to destination file
   * @param {bool}    overwrite   If can overwrite an existing file
   */
  function _copyFile(source, destination, overwrite){
    overwrite = overwrite || false;
    _fso.CopyFile(source, _absolutePath(destination), overwrite);
  }

  module.exports = {
    CONST: _consts,

    // Path
    absolutePath: _absolutePath,
    combine: _combinePath,

    // Files
    fileExists: _fileExists,
    createTextFile: _createTextFile,
    createTextFileWithContent: _createTextFileWithContent,
    deleteFile: _deleteFile,
    getTextFileContent:_getTextFileContent,
    getArrayFileContent:_getArrayFileContent,
    getTempFileName: _getTempFileName,
    copyFile: _copyFile,

    // Directory
    directoryExists: _directoryExists,
    createDirectory: _createDirectory,
    deleteDirectory: _deleteDirectory,
    getSpecialDirectory: _getSpecialDirectory,
    getDirectoryPath: _getDirectoryPath,
    getDirectoryItems: _getDirectoryItems,
    copyDirectory: _copyDirectory
  }
})();
