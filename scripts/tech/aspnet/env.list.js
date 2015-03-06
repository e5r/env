// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(_){ 'use strict'
  _.su = sys.require('sysutils.js');

  // Read comment "Runner Plugin Environment API" in <cmdrunner.js> for
  // more information of environment API
  _.env;

  /**
   * Set environment configuration
   */
  _.setup = function(env){
    _.env = env;
    return true;
  }

  /**
   * Run command entry point
   */
  _.run = function(args){
    try {
      var _args = [
            'kvm.ps1',
            'list'
          ].concat(args),
          _found = false;

      var _job = _.su.exec('powershell', _args, function(line){
        if(line && line.length > 0){
          sys.logAction(line);
          _found = true;
        }
      });

      if(!_found){
        sys.logAction('No version available.');
      }
    }catch(error){
      sys.logTask('A error ocurred on showing installed runtime.');
      throw error;
    }
  }

  command.api = {
    setup: _.setup,
    run: _.run
  }
})({});
