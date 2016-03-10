'use strict';
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var browserify = require('browserify');

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

  return b.bundle()
    .pipe(source(outputName))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    // Add transformation tasks to the pipeline here.
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('.'));
});
gulp.task('buildd', [], function() {
  gulp.watch(src, ['build']);
  gulp.start('build');
});
