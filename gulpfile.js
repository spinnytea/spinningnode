'use strict';
var browserify = require('browserify');
var express = require('express');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');

var entryPoint = './index.js';
var outputName = 'spinningnode.js';

var src = [
  entryPoint,
  'lib/**/*.js'
];

var resource = [
  './index.html',
  './template/**/*'
];

gulp.task('lint', [], function () {
  return gulp.src(src).pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');

gulp.task('build', ['lint'], function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: entryPoint,
    debug: true
  });

  gulp.src('index.html')
    .pipe(gulp.dest('dist'));

  return b.bundle()
    .pipe(source(outputName))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    // Add transformation tasks to the pipeline here.
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));
});
gulp.task('buildd', [], function() {
  gulp.watch(src, ['build']);
  gulp.start('build');
});

gulp.task('mocha', ['lint'], function() {
  return gulp.src('test/**/*.js', {read: false})
    .pipe(mocha({reporter: 'nyan'}));
});
gulp.task('test', [], function() {
  gulp.watch(['lib/**/*.js', 'test/**/*.js'], ['mocha']);
  gulp.start('mocha');
});

gulp.task('host', function() {
  var app = express();
  app.use('/vendor', express.static('vendor'));
  app.use('/template', express.static('template'));
  app.use('/', express.static('dist'));
  app.listen(3000, function() {});
});