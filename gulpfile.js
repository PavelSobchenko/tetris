'use strict';

const gulp = require('gulp');
const data = require('gulp-data');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const rename = require("gulp-rename");
const uglify = require('gulp-uglify');

const config = {
    scripts: {
        url: ['js/**/**/*.js', 'js/**/*.js', 'js/*.js', '!js/main.min.js'],
        output: 'main.min.js',
        dest : 'js/'
    },
    libs: {
        url: ['lib/core/jquery-3.1.1.js', 'lib/core/underscore.js', 'lib/core/backbone.js'],
        output: 'all.min.js',
        dest : 'lib/'
    }
};

gulp.task('compile:scripts', () => {
    let {url, output, dest} = config.scripts;
    return gulp.src(url)
        .pipe(sourcemaps.init())
        .pipe(concat(output))
        .pipe(uglify({mangle: true}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest));
});

gulp.task('compile:libs', () => {
    let {url, output, dest} = config.libs;
    return gulp.src(url)
        .pipe(sourcemaps.init())
        .pipe(concat(output))
        .pipe(uglify({mangle: true}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest));
});

gulp.task('watching', () => {
    let compiled = config.scripts.output;

    gulp.watch(['js/*.js', 'js/**/*.js', 'js/**/**/*.js', '!'+compiled], ['compile:scripts']);
});