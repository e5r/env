// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(_){ 'use strict'
  _.CONSTS = {
    // SpecialFolder Bit's
    SF_WINDOWS: 0,
    SF_SYSTEM: 1,
    SF_TEMP: 2
  };

  /**
   * Get path to a special directory in system.
   *
   * @param {int} bit _.CONSTS SF_X value
   *
   * @return Path to a special directory
   */
  _.getSpecialDirectory = function(bit){
    if(bit != _.CONSTS.SF_WINDOWS && bit != _.CONSTS.SF_SYSTEM && bit != _.CONSTS.SF_TEMP){
      throw new Error('Invalid bit to Special Folder.');
    }
    return _fso.GetSpecialFolder(bit);
  }

  /**
   * Generate a temporary file name.
   *
   * @return Path to a temporary file
   */
  _.getTempFileName = function(){
    var _tempPath = _getSpecialPath(_.CONSTS.SF_TEMP);
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
  _.fileExists = function(path){
    var _path = _.absolutePath(path);
    return _fso.FileExists(_path);
  }

  /**
   * Verify path correspond to a exist directory.
   *
   * @param {string} path Path to a directory
   *
   * @return TRUE if exists or FALSE if not exists
   */
  _.directoryExists = function(path){
    var _path = _.absolutePath(path);
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
  _.createDirectory = function(path){
    var _path = _.absolutePath(path),
        _parent = _.getDirectoryPath(_path);
    if(_parent && !_.directoryExists(_parent)){
      _.createDirectory(_parent);
    }
    if(!_.directoryExists(_path)){
      _fso.CreateFolder(_path);
    }
    return _path;
  }

  /**
   * Generate absolute path from relative path.
   *
   * @param {string} path Relative path to generate
   *
   * @return Absolute path
   */
  _.absolutePath = function(path){
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
  _.combinePath = function(){
    if(arguments.length < 1) return;
    var _path = _.absolutePath(arguments[0]);
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
  _.getDirectoryPath = function(path){
    var _path = _.absolutePath(path);
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
  _.createTextFile = function(path, overwrite, unicode){
    overwrite = overwrite || false;
    unicode = unicode || false;
    return _fso.CreateTextFile(_.absolutePath(path), overwrite, unicode);
  }

  /**
   * Create a new Text file and fill content.
   *
   * @param {string}  path          Path to file
   * @param {string|array} content  Content file
   * @param {bool}    overwrite     If can overwrite an existing file
   * @param {bool}    unicode       If file is created as a Unicode or ASCII
   */
  _.createTextFileWithContent = function(path, content, overwrite, unicode){
    overwrite = overwrite || false;
    unicode = unicode || false;

    var _file = _.createTextFile(path, overwrite, unicode);
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
  _.getTextFileContent = function(path){
    return _fso.OpenTextFile(_.absolutePath(path), 1).ReadAll();
  }

  /**
   * Read content of text file
   *
   * @param {string} path   Path to file
   *
   * @return Array with lines of content file
   */
  _.getArrayFileContent = function(path){
    var _file = _fso.OpenTextFile(_.absolutePath(path), 1),
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
  _.deleteFile = function(path){
    _fso.DeleteFile(_.absolutePath(path));
  }

  /**
   * Remove the folder with all content
   *
   * @param {string} path Path to directory
   */
  _.deleteDirectory = function(path){
    _fso.DeleteFolder(_.absolutePath(path));
  }

  /**
   * Return a items (files and subdirectorys) of directory
   *
   * @param {string} path Path to directory
   *
   * @return Array of {type(file|directory), path} items
   */
  _.getDirectoryItems = function(path, matchRegex){
    var _path = _.absolutePath(path),
        _items = [],
        _match = RegExp.prototype.isPrototypeOf(matchRegex) ? matchRegex : /./g,
        _directory,
        _folderIterator,
        _fileIterator;

    if(!_.directoryExists(_path))
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
  _.copyDirectory = function(source, destination){
    _fso.CopyFolder(source, _.absolutePath(destination));
  }

  /**
   * Copy a file to a destination path
   *
   * @param {string}  source      Path to origin file
   * @param {string}  destination Path to destination file
   * @param {bool}    overwrite   If can overwrite an existing file
   */
  _.copyFile = function(source, destination, overwrite){
    overwrite = overwrite || false;
    _fso.CopyFile(source, _.absolutePath(destination), overwrite);
  }

  module.exports = {
    CONST: _.CONSTS,

    // Path
    absolutePath: _.absolutePath,
    combine: _.combinePath,

    // Files
    fileExists: _.fileExists,
    createTextFile: _.createTextFile,
    createTextFileWithContent: _.createTextFileWithContent,
    deleteFile: _.deleteFile,
    getTextFileContent:_.getTextFileContent,
    getArrayFileContent:_.getArrayFileContent,
    getTempFileName: _.getTempFileName,
    copyFile: _.copyFile,

    // Directory
    directoryExists: _.directoryExists,
    createDirectory: _.createDirectory,
    deleteDirectory: _.deleteDirectory,
    getSpecialDirectory: _.getSpecialDirectory,
    getDirectoryPath: _.getDirectoryPath,
    getDirectoryItems: _.getDirectoryItems,
    copyDirectory: _.copyDirectory
  }
})({});
