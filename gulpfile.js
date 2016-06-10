'use strict';
var _ = require('lodash');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var cleanCSS = require('gulp-clean-css');
var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var mocha = require('gulp-mocha');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var templateCache = require('gulp-angular-templatecache');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');

var entryPoint = './index.js';
var outputName = 'spinningnode.js';
var zipName = 'spinningnode.zip';

var js = [ entryPoint, 'lib/**/*.js' ];
var html = [ 'lib/**/*.html' ];
var css = [ 'lib/**/*.less', '!lib/palette/*.less' ];
var resource = [ 'index.html', 'lib/**/*.png', 'lib/**/*.jpg', 'lib/**/*.otf' ];

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
gulp.task('lint', [], function () {
  return gulp.src(js).pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('build-html', [], function() {
  return gulp.src(html)
    .pipe(templateCache({ standalone: true }))
    .pipe(gulp.dest('dist'));
});

gulp.task('build-css', [], function() {
  return gulp.src(css)
    .pipe(sourcemaps.init())
    .pipe(less())
    .on('error', function() { gutil.log(arguments); this.emit('end'); })
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('build-resource', [], function() {
  return gulp.src(resource)
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['build-js', 'build-html', 'build-css', 'build-resource'], function() {});
gulp.task('buildd', [], function() {
  gulp.watch(js, ['build-js']);
  gulp.watch(html, ['build-html']);
  gulp.watch(css, ['build-css']);
  gulp.watch(resource, ['build-resource']);
  gulp.start('build');
});
gulp.task('package', ['build', 'mocha'], function() {
  return gulp.src(['dist/**/*', '!dist/'+zipName, '!dist/**/*.map'])
    .pipe(zip(zipName))
    .pipe(gulp.dest('dist'));
});

gulp.task('mocha', ['lint'], function() {
  return gulp.src('test/**/*.js', {read: false})
    .pipe(mocha({reporter: 'nyan'}));
});
gulp.task('test', [], function() {
  gulp.watch(['lib/**/*.js', 'test/**/*.js'], ['mocha']);
  gulp.start('mocha');
});
