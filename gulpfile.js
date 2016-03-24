'use strict';
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var express = require('express');
var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var mocha = require('gulp-mocha');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var templateCache = require('gulp-angular-templatecache');
var uglify = require('gulp-uglify');

var entryPoint = './index.js';
var outputName = 'spinningnode.js';

var src = [
  entryPoint,
  'lib/**/*.js'
];

var resource = [
  'template/**/*.less'
].concat(src);

gulp.task('lint', [], function () {
  return gulp.src(src).pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('build-less', [], function() {
  return gulp.src(['lib/**/*.less'])
    .pipe(sourcemaps.init())
    .pipe(less({
      paths: [ 'template/palette' ]
    }))
    .on('error', function() { gutil.log(arguments); this.emit('end'); })
    .pipe(minifyCSS())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/template'));
});
gulp.task('build-html', [], function() {
  gulp.src('index.html')
    .pipe(gulp.dest('dist'));

  gulp.src('lib/**/*.png')
    .pipe(gulp.dest('dist/template'));

  return gulp.src('lib/**/*.html')
    .pipe(templateCache({
      standalone: true,
    }))
    .pipe(gulp.dest('dist'));
});
gulp.task('build-js', ['lint'], function () {
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
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});
gulp.task('build', ['build-js', 'build-html', 'build-less'], function() {});
gulp.task('buildd', [], function() {
  gulp.watch(resource, ['build']);
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

gulp.task('host', [], function() {
  var app = express();
  app.use('/vendor', express.static('vendor'));
  app.use('/template', express.static('template'));
  app.use('/', express.static('dist'));
  app.listen(3000, function() {});
});
gulp.task('hostd', [], function() {
  gulp.start('host');
  gulp.start('buildd');
});
