[![build status](https://secure.travis-ci.org/jharding/grunt-exec.png?branch=master)](http://travis-ci.org/jharding/grunt-exec)
grunt-exec
==========

> Grunt plugin for executing shell commands.

Getting Started
---------------

Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-exec`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-exec');
```

[grunt]: https://github.com/cowboy/grunt
[getting_started]: https://github.com/cowboy/grunt/blob/master/docs/getting_started.md

Documentation
-------------

This plugin is a [multi task][types_of_tasks], meaning that grunt will automatically iterate over all `exec` targets if a target is not specified.

If the command used outputs to stderr, grunt-exec will display a warning and abort grunt immediately. Grunt will continue processing tasks if the --force command-line option was specified.

[types_of_tasks]: https://github.com/cowboy/grunt/blob/master/docs/types_of_tasks.md

### Target Properties

*   __command__*(required)*: The shell command to be executed. Must be a string or a function that returns a string.
*   __stdout__*(optional)*: Set `true` if you want the stdout to be printed. Defaults to `false`.

### Example

```javascript
grunt.initConfig({
  exec: {
    remove_logs: {
      command: 'rm -f *.log'
    },
    list_files: {
      command: 'ls -l **',
      stdout: true
    },
    echo_grunt_version: {
      command: function(grunt) { return 'echo ' + grunt.version; },
      stdout: true
    }
  }
});
```

License
-------

Copyright (c) 2012 Jake Harding  
Licensed under the MIT license.
