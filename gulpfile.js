'use strict';

const extensionName = 'Battlelog-Notifier';

const fs = require('fs');
const cleanhtml = require('gulp-cleanhtml');
const crx = require('gulp-crx');
const del = require('del');
const gulp = require('gulp');
const minifycss = require('gulp-minify-css');
const stripdebug = require('gulp-strip-debug');
const vinylpaths = require('vinyl-paths');
const zip = require('gulp-zip');

// Clean build directory
gulp.task('clean', () => {
  return gulp.src('build/*')
    .pipe(vinylpaths(del));
});

// Copy and compress HTML files
gulp.task('html', () => {
  return gulp.src('src/*.html')
    .pipe(cleanhtml())
    .pipe(gulp.dest('build'));
});

// Copy scripts
gulp.task('scripts', () => {
  gulp.src('src/vendor/**/*.js')
    .pipe(gulp.dest('build/vendor'));
  return gulp.src(['src/*.js', '!src/vendor/**/*.js'])
    .pipe(stripdebug())
    .pipe(gulp.dest('build'));
});

// Copy and minify CSS
gulp.task('styles', () => {
  gulp.src('src/**/*.min.css')
    .pipe(gulp.dest('build'));
  return gulp.src(['src/*.css', '!src/vendor/**/*.css'])
    .pipe(minifycss({root: 'src', keepSpecialComments: 0}))
    .pipe(gulp.dest('build'));
});

// Copy static files
gulp.task('copy', () => {
  gulp.src('src/*.png')
    .pipe(gulp.dest('build'));
  gulp.src('src/*.ogg')
    .pipe(gulp.dest('build'));
  gulp.src('src/_locales/**')
    .pipe(gulp.dest('build/_locales'));
  return gulp.src('src/manifest.json')
    .pipe(gulp.dest('build'));
});

// Build
gulp.task('build', ['clean', 'html', 'scripts', 'styles', 'copy']);

// Build ditributable (ZIP)
gulp.task('zip', ['build'], () => {
  const manifest = require('./build/manifest.json');
  const distFileName = extensionName + '_v' + manifest.version + '.zip';
  return gulp.src(['build/**'])
    .pipe(zip(distFileName))
    .pipe(gulp.dest('dist'));
});

// Build distributable (CRX) extension
gulp.task('crx', ['build'], () => {
  const manifest = require('./build/manifest.json');
  const crxFileName = extensionName + '_v' + manifest.version + '.crx';
  return gulp.src('build')
    .pipe(crx({
      privateKey: fs.readFileSync('./certs/key', 'utf8'),
      filename: crxFileName
    }))
    .pipe(gulp.dest('dist'));
});

// Build distributable
gulp.task('dist', ['zip']);

// Run build task by default
gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
