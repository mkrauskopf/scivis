// Include gulp
var gulp = require('gulp');
var reactify = require('reactify');  // Transforms React JSX to JS.
var source = require("vinyl-source-stream");
var browserify = require('browserify');

// Include Our Plugins
var jshint = require('gulp-jshint'),
    sass   = require('gulp-sass'),
    concat = require('gulp-concat'),
    notify = require("gulp-notify"),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

// Lint Task
gulp.task('lint', function() {
    return gulp.src('js/*.js')
               .pipe(jshint())
               .pipe(jshint.reporter('default'));
});

// Compile Our Sass
gulp.task('sass', function() {
    return gulp
        .src('./source/scss/main.scss')
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: 'expanded',
            style: 'compressed',
            loadPath: [
                './node_modules/bootstrap-sass/assets/stylesheets',
            ]
        }).on('error', sass.logError))
        .pipe(gulp.dest('./public/css'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    var b = browserify({
          insertGlobals : true,
          debug : !gulp.env.production
    });
    b.transform(reactify); // use the reactify transform
    b.add('source/js/main.js');
    return b.bundle()
            .pipe(source('main.js'))
            .pipe(gulp.dest('./public/js'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('source/js/**/*.js', ['lint', 'scripts']);
    gulp.watch('source/scss/*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['lint', 'sass', 'scripts', 'watch']);

