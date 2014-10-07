module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // Doc generation
    coveralls: {
      options: {
        // LCOV coverage file relevant to every target
        src: 'coverage-results/lcov.info',

        // When true, grunt-coveralls will only print a warning rather than
        // an error, to prevent CI builds from failing unnecessarily (e.g. if
        // coveralls.io is down). Optional, defaults to false.
        force: false
      },
      test: {
        // Target-specific LCOV coverage file
        src: 'coverage-results/results-*.info'
      },
    },
    // Configure a mochaTest task
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          quiet: false // Optionally suppress output to standard out (defaults to false)
        },
        src: ['test/**/*.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-coveralls');

  grunt.registerTask('test', ['mochaTest']);

};
