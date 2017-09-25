(function(){
  "use strict";
  var path = require('path'),
      gulp = require('gulp'),
      concat = require('gulp-concat'),
      ngAnnotate = require('gulp-ng-annotate'),
      uglify = require('gulp-uglify'),
      jshint = require('gulp-jshint'),
      eslint = require('gulp-eslint'),
      KarmaServer = require('karma').Server,
      dependencies = require('./web/public/dependencies.json'),
      app = require('./web/public/app.json'),
      cdfApp = require('./web/public/cdf-app.json'),
      less = require('gulp-less'),
      qdom = require('gulp-qdom'),
      tap = require('gulp-tap'),
      del = require('del');
  var lessFiles = [ relativePath('./web/public/css/app.less'), relativePath('./web/public/js/directives/**/*.less')];
  function relativePath(paths) {
    var buildPath = function (depPath) {
      var excluded = depPath[0] === '!';
      if (excluded) depPath = depPath.substring(1);
      depPath = path.join(__dirname, depPath);
      return excluded ? '!' + depPath : depPath;
    }

    if (paths.constructor === [].constructor) {
      for (var i = 0; i < paths.length; i++) {
        paths[i] = buildPath(paths[i]);
      }
      return paths;
    } else {
      return buildPath(paths);
    }

  }

  gulp.task('clean', function () {
    return del(relativePath([
      './web/public/dist/**/*'
    ]));
  });

  gulp.task('jshint', function () {
    return gulp.src(relativePath(['./web/public/**/*.js', '!./web/public/components/**', '!./web/public/dist/**']))
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .pipe(jshint.reporter('fail'));
  });

  gulp.task('lint', function() {
    return gulp.src(relativePath(['**/*.js']))
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  });

  gulp.task('validateHTML', function () {
    var currentFile = void 0;
    var errors = {};
    return gulp.src(relativePath(['./web/public/**/*.dust']))
    .pipe(tap(function(file, t) {
        currentFile = file.path;
     }))
    .pipe(qdom(function($){
      var clickables = $("button, *[ng-click], *.btn");
       for(var clickableIndex = 0; clickableIndex < clickables.length; clickableIndex ++) {
        var clickable = $(clickables[clickableIndex]);
        console.log(clickable);
        if (!errors[currentFile]) errors[currentFile] = [];
        if (clickable['aria-label'] !== ''){
          errors[currentFile].push(clickable[0].name + ' ' + clickable.text() + ' should have an aria-label');
        }
        if (clickable['data-name'] !== ''){
          errors[currentFile].push(clickable[0].name + ' ' + clickable.text() + ' should have an data-name for analytics');
        }
      }
    }))
    .on('end', function(){
      for (var fileName in errors) {
        console.warn('in '+ fileName);
        for (var i = 0; i < errors[fileName].length; i++){
          console.warn(errors[fileName][i]);
        }
      }
     })
  })

  gulp.task('build-dependencies', ['clean'], function () {
    return gulp.src(relativePath(dependencies))
      .pipe(ngAnnotate())
      .pipe(concat('dependencies.js'))
      .pipe(uglify())
      .pipe(gulp.dest(relativePath('./web/public/dist/')));
  });

  gulp.task('build-less', ['clean'], function () {
    return gulp.src(lessFiles)
      .pipe(concat('app.less'))
      .pipe(less({
        compress: true,
        paths: relativePath('./web/public/css/')
      }))
      .pipe(gulp.dest(relativePath('./web/public/dist/css/')))
  });

  gulp.task('build-cdf', ['build'], function () {
    var _app = Array.from(app);
    //Remove original init-master
    for (var appIndex in _app) {
      if (_app[appIndex].indexOf('init-master') > -1) {
        _app.splice(appIndex, 1);
      }
    }
    //Append cdf sources
    for (var index in cdfApp) {
        _app.push(cdfApp[index]);
    }
    return gulp.src(relativePath(_app))
      .pipe(ngAnnotate())
      .pipe(concat('cdf-app.js'))
      //.pipe(uglify()) // Commented out until we figure it out why it's breaking
      .pipe(gulp.dest(relativePath('./web/public/dist/')));
  });

  gulp.task('build', ['clean', 'jshint', 'lint', 'build-less', 'build-dependencies'], function () {
    var _app = Array.from(app);
    for (var index in cdfApp) {
      _app.push('!' + cdfApp[index]);
    }
    return gulp.src(relativePath(_app))
      .pipe(ngAnnotate())
      .pipe(concat('app.js'))
      // .pipe(uglify()) // Commented out until we figure it out why it's breaking
      .pipe(gulp.dest(relativePath('./web/public/dist/')));
  });

  gulp.task('watch-less', ['build-cdf'], function(){
    return gulp.watch([ relativePath('./web/public/css/**/*.less'), relativePath('./web/public/js/directives/**/*.less')], ['build-less']);
  });

  gulp.task('default', ['build-cdf']);

  gulp.task('dev', ['watch-less']);
})();
