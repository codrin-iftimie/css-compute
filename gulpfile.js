var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var reactify = require('reactify');
var sequence = require("run-sequence");
var clean = require("gulp-clean");
var express = require("express");
var livereload = require('gulp-livereload');
var rename = require('gulp-rename');
var less = require("gulp-less");
var notify = require('gulp-notify');
var watchify = require("watchify");

var production = process.env.NODE_ENV === 'production';
var SERVER_PORT = 3009;

var stylesGlob = './styles/*.less',
    scriptsGlob = ['./src/**/*.js*', './lib/**/*.js*', './node_modules/react/**/*.js'],
    imagesGlob = ['./styles/**/*{.jpg,.png}'],
    htmlGlob = ['./app/**/*{.html,.htm}'],
    buildGlob = './dist/**/*'; 

function lessTransform() {
  return less({
    sourceMap: !production
  });
}

function handleError(task) {
  return function(err) {
    console.log(err)
    notify.onError(task + ' failed, check the logs..')(err);
  };
}

function scripts(watch) {
  console.log(__dirname)
  var bundler, rebundle;
  if(watch) {
    bundler = watchify('./src/app.jsx', {basedir: __dirname});
  } else {
    bundler = browserify('./src/app.jsx', {basedir: __dirname});
  }
 
  bundler.transform(reactify);
 
  rebundle = function() {
    var stream = bundler.bundle({debug: !production});
    stream.on('error', handleError('Browserify'));
    stream = stream.pipe(source('app.js'));
    return stream.pipe(gulp.dest('./dist/js'));
  };
 
  bundler.on('update', rebundle);
  return rebundle();
}

gulp.task('scripts', function() {
  return scripts(false);
});
 
gulp.task('watchScripts', function() {
  return scripts(true);
});

gulp.task("clean", function() {
  return gulp.src("./dist", { read: false }).pipe(clean());
});

gulp.task("less", function() {
  return gulp.src('styles/main.less')
             .pipe(lessTransform())
             .pipe(gulp.dest('./styles'))
             .pipe(gulp.dest('./dist/styles'))
});

gulp.task("watch", function() {
  var server = livereload();
  gulp.watch(stylesGlob, ['less']);
  gulp.watch(scriptsGlob, ['watchScripts']);
  gulp.watch(buildGlob).on("change", function(event) {
    server.changed(event.path);
  });
});

gulp.task("build", function(done) {
  sequence(
    "clean",
    ["less", "scripts"],
    done
  );
});

gulp.task("server", function(next) {
  var server = express();
  server.use(express.static('src'));
  server.use(express.static('dist'));
  server.listen(SERVER_PORT, next);
});

gulp.task("default", ["build", "server", "watch"]);