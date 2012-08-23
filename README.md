[![build status](https://secure.travis-ci.org/jharding/grunt-exec.png)](http://travis-ci.org/jharding/grunt-exec)
# grunt-exec

Grunt task for executing shell commands.

## Getting Started
Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-exec`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-exec');
```

[grunt]: https://github.com/cowboy/grunt
[getting_started]: https://github.com/cowboy/grunt/blob/master/docs/getting_started.md

## Documentation
This task is a [multi task][types_of_tasks], meaning that grunt will automatically iterate over all `exec` targets if a target is not specified.

[types_of_tasks]: https://github.com/cowboy/grunt/blob/master/docs/types_of_tasks.md

### Target Properties
*   __command__*(required)*: The shell command to be executed. Must be a string.
*   __stdout__*(optional)*: Set `true` if you want the stdout to be printed. Defaults to `false`.
*   __stderr__*(optional)*: Set `true` if you want the stderr to be printed. Defaults to `false`.

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
    }
  }
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

## Release History
*   __04/16/2012 - 0.1.1__: Fixed broken links on npm registry page.
*   __04/08/2012 - 0.1.0__: Initial release.

## License
Copyright (c) 2012 Jake Harding  
Licensed under the MIT license.
