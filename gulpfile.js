var path = require('path'),
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    ngAnnotate = require('gulp-ng-annotate'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    semistandard = require('gulp-semistandard'),
    KarmaServer = require('karma').Server;
    dependencies = require('./web/public/dependencies.json'),
    app = require('./web/public/app.json'),
    less = require('gulp-less')
    del = require('del');

function relativePath(paths) {
  if (paths.constructor === [].constructor) {
    for (var i = 0; i < paths.length; i++) {
      paths[i] = path.join(__dirname, paths[i]);
    }
    return paths;
  } else {
    return path.join(__dirname, paths);
  }
}

gulp.task('clean', function () {
  return del(relativePath([
    './web/public/dist/**/*'
  ]));
});

gulp.task('jshint', function () {
  return gulp.src(relativePath([
      './web/controllers/**/*.js',
      './lib/**/*.js',
      './web/models/!**!/!*.js',
      './web/public/js/**/*.js'
    ]))
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('semistandard', function () {
  return gulp.src(relativePath([
      './lib/**/*.js'
    ]))
    .pipe(semistandard())
    .pipe(semistandard.reporter('default', {
      breakOnError: true
    }));
});

gulp.task('build-dependencies', ['clean'], function () {
  return gulp.src(relativePath(dependencies))
    .pipe(ngAnnotate())
    .pipe(concat('dependencies.js'))
    .pipe(uglify())
    .pipe(gulp.dest(relativePath('./web/public/dist/')));
});

gulp.task('build-less', ['clean'], function () {
  return gulp.src(relativePath('./web/public/css/app.less'))
    .pipe(less({
      compress: true
    }))
    .pipe(gulp.dest(relativePath('./web/public/dist/css/')))
});

gulp.task('build', ['clean', 'jshint', 'build-less', 'build-dependencies'], function () {

  return gulp.src(relativePath(app))
    .pipe(ngAnnotate())
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest(relativePath('./web/public/dist/')));
});

gulp.task('test', ['semistandard', 'build'], function (done) {
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('default', ['test']);
