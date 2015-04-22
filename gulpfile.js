'use strict';
/*
 * Task guide:
 *
 * watch - Generate the main output file using watchify (rebuild on modification)
 * build - Generate the main output file using browserify (single build)
 * run   - Run a server to host the project directory as the server document root
 *
 */

// Port the application should launch on
var port = 3000;

// Enable/disable browserSync (auto reload)
var autoReload = true;

// Dependencies of named tasks (what to run when)
var tasks = {
  default: ['run'],
  run:     ['watch']
};

// The main entry point and output file of your application
// Browserify will generate the output file in the root of your project
var entryPoint = './index.js';
var outputName = 'spinningnode.js';

// Application source files - be sure to include the entryPoint file
// DO NOT include the output file - it will be regenerated automatically
var src = [
  entryPoint, 'lib/**/*.js'
];

// Additional resource files that should trigger a refresh
var resource = [
  './index.html',
  './template/**/*', './resource/**/*'
];

// Global variables to make available (use in your scripts with `var <name> = require(<keyname>);`)
// This will be replaced by Browserify with `window.<value>`
var exposify = require('exposify');
exposify.config = {
  'angular':   'angular',
  'socket.io': 'io'
};

// ==================================== DO NOT EDIT BELOW THIS LINE ====================================

// Gulp utilities
var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var jshint = require('gulp-jshint');
var gulpif = require('gulp-if');
var shell = require('gulp-shell');

// Browserify framework
var browserify = require('browserify');
var watchify = require('watchify');
var ngify = require('ngify');

// Server dependencies
var express = require('express');
var serveStatic = require('serve-static');
var browserSync = require('browser-sync');

gulp.task('jshint', [], function () {
  return gulp.src(src)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

var bundler;
var enableWatch = false;
gulp.task('generate', [], function () {
  if(!bundler) {
    bundler = browserify({
      entries: [ entryPoint ],
      debug: true,
      cache: {},
      packageCache: {},
      fullPaths: true
    });

    if(enableWatch) {
      bundler = watchify(bundler);
      bundler.on('update', bundle);
    }
    bundler.on('log', gutil.log.bind(gutil, gutil.colors.blue('Watchify')));

    bundler.transform(exposify, {
      global: true
    });

    bundler.transform(ngify, {
      global: true
    });
  }

  function bundle () {
    return bundler.bundle()
      .on('error', gutil.log.bind(gutil, gutil.colors.red('Browserify')))
      .pipe(source(outputName))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(uglify({ output: { beautify: true, indent_level: 2 } }))
      .pipe(sourcemaps.write('./', {includeContent: false, sourceRoot: ''}))
      .pipe(gulp.dest('.'))
      .pipe(gulpif(autoReload, browserSync.reload({stream: true})));
  }

  return bundle();
});

gulp.task('watch', [], function () {
  enableWatch = true;
  if(autoReload) gulp.watch(resource, browserSync.reload);
  gulp.start('generate');
});

gulp.task('build', ['jshint'], function () {
  return gulp.start('generate');
});

gulp.task('run', tasks.run, function () {
  var app = express();
  var server = require('http').Server(app);

  app.use(serveStatic('./'));
  var appPort = (autoReload) ? (port+1) : port;
  server.listen(appPort, function () {
    if(autoReload) {
      browserSync({
        proxy: 'localhost:' + appPort,
        port: port,
        online: false,
        injectChanges: false,
        open: false,
        logPrefix: 'spinny'
      });
    }
  });
});

gulp.task('default', tasks.default);