'use strict';

var extension_name = 'Battlelog-Notifier';

var gulp = require('gulp'),
    clean = require('gulp-clean'),
    cleanhtml = require('gulp-cleanhtml'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    stripdebug = require('gulp-strip-debug'),
    uglify = require('gulp-uglify'),
    zip = require('gulp-zip'),
    fs = require('fs'),
    crx = require('gulp-crx');

// clean build directory
gulp.task('clean', function() {
    return gulp.src('build/*', {read: false})
        .pipe(clean());
});

// copy static files
gulp.task('copy', function() {
    gulp.src('extension/*.png')
        .pipe(gulp.dest('build'));
    gulp.src('extension/_locales/**')
        .pipe(gulp.dest('build/_locales'));
    return gulp.src('extension/manifest.json')
        .pipe(gulp.dest('build'));
});

// copy and compress HTML files
gulp.task('html', function() {
    return gulp.src('extension/*.html')
        .pipe(cleanhtml())
        .pipe(gulp.dest('build'));
});

// run scripts through JSHint
gulp.task('jshint', function() {
    return gulp.src('extension/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// copy lib (vendor) scripts
// and uglify all other scripts
gulp.task('scripts', ['jshint'], function() {
    gulp.src('extension/lib/**/*.js')
        .pipe(gulp.dest('build/lib'));
    return gulp.src(['extension/*.js', '!extension/lib/**/*.js'])
        .pipe(stripdebug())
        .pipe(uglify())
        .pipe(gulp.dest('build'));
});

// copy and minify CSS
gulp.task('styles', function() {
    gulp.src('extension/**/*.min.css')
        .pipe(gulp.dest('build'));
    return gulp.src(['extension/*.css', '!extension/lib/**/*.css'])
        .pipe(minifycss({root: 'extension', keepSpecialComments: 0}))
        .pipe(gulp.dest('build'));
});

// build ditributable after other tasks completed
gulp.task('zip', ['html', 'scripts', 'styles', 'copy'], function() {
    var manifest = require('./extension/manifest.json'),
        distFileName = extension_name + '_v' + manifest.version + '.zip';
    return gulp.src(['build/**'])
        .pipe(zip(distFileName))
        .pipe(gulp.dest('dist'));
});

// build distributable (CRX) extension
gulp.task('crx', ['zip'], function() {
    var manifest = require('./build/manifest.json'),
        crxFileName = extension_name + '_v' + manifest.version + '.crx';
    return gulp.src('build')
        .pipe(crx({
          privateKey: fs.readFileSync('./certs/key', 'utf8'),
          filename: crxFileName
        }))
        .pipe(gulp.dest('dist'));
});

// run all tasks after build directory has been cleaned
gulp.task('default', ['clean'], function() {
    gulp.start('crx');
});
