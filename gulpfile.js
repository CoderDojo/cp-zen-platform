const path = require('path');
const gulp = require('gulp');
const concat = require('gulp-concat');
const ngAnnotate = require('gulp-ng-annotate');
const uglify = require('gulp-uglify');
const jshint = require('gulp-jshint');
const eslint = require('gulp-eslint');
const dependencies = require('./web/public/dependencies.json');
const app = require('./web/public/app.json');
const cdfApp = require('./web/public/cdf-app.json');
const less = require('gulp-less');
const qdom = require('gulp-qdom');
const tap = require('gulp-tap');
const nodemon = require('gulp-nodemon');
const del = require('del');

const lessFiles = [
  relativePath('./web/public/css/app.less'),
  relativePath('./web/public/js/directives/**/*.less'),
];

function relativePath(paths) {
  const buildPath = (arg) => {
    let depPath = arg;
    const excluded = depPath[0] === '!';
    if (excluded) depPath = depPath.substring(1);
    depPath = path.join(__dirname, depPath);
    return excluded ? `!${depPath}` : depPath;
  };

  if (paths.constructor === [].constructor) {
    for (let i = 0; i < paths.length; i += 1) {
      paths[i] = buildPath(paths[i]);
    }
    return paths;
  }
  return buildPath(paths);
}

gulp.task('clean', () => del(relativePath(['./web/public/dist/**/*'])));

gulp.task('jshint', () =>
  gulp
    .src(
      relativePath([
        './web/public/js/**/*.js',
        '!./web/public/components/**',
        '!./web/public/dist/**',
      ]),
    )
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail')),
);

gulp.task('lint', () =>
  gulp
    .src(relativePath(['**/*.js', '!node_modules/**', '!web/public/**']))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError()),
);

gulp.task('validateHTML', () => {
  let currentFile;
  const errors = {};
  return gulp
    .src(relativePath(['./web/public/**/*.dust']))
    .pipe(
      tap((file) => {
        currentFile = file.path;
      }),
    )
    .pipe(
      qdom(($) => {
        const clickables = $('button, *[ng-click], *.btn');
        for (let clickableIndex = 0; clickableIndex < clickables.length; clickableIndex += 1) {
          const clickable = $(clickables[clickableIndex]);
          console.log(clickable); // eslint-disable-line no-console
          if (!errors[currentFile]) errors[currentFile] = [];
          if (clickable['aria-label'] !== '') {
            errors[currentFile].push(
              `${clickable[0].name} ${clickable.text()} should have an aria-label`,
            );
          }
          if (clickable['data-name'] !== '') {
            errors[currentFile].push(
              `${clickable[0].name} ${clickable.text()} should have an data-name for analytics`,
            );
          }
        }
      }),
    )
    .on('end', () => {
      errors.forEach((fileName) => {
        console.warn(`in ${fileName}`); // eslint-disable-line no-console
        fileName.forEach((err) => {
          console.warn(err); // eslint-disable-line no-console
        });
      });
    });
});

gulp.task('build-dependencies', ['clean'], () =>
  gulp
    .src(relativePath(dependencies))
    .pipe(ngAnnotate())
    .pipe(concat('dependencies.js'))
    .pipe(uglify())
    .pipe(gulp.dest(relativePath('./web/public/dist/'))),
);

gulp.task('build-less', ['clean'], () =>
  gulp
    .src(lessFiles)
    .pipe(concat('app.less'))
    .pipe(
      less({
        compress: true,
        paths: relativePath('./web/public/css/'),
      }),
    )
    .pipe(gulp.dest(relativePath('./web/public/dist/css/'))),
);

gulp.task('build-cdf', ['build'], () => {
  const appArray = Array.from(app);
  // Remove original init-master
  appArray.forEach((appLocal, index) => {
    if (appLocal.includes('init-master')) {
      appArray.splice(index, 1);
    }
  });
  // Append cdf sources
  cdfApp.forEach((appLocal) => {
    appArray.push(appLocal);
  });
  return (
    gulp
      .src(relativePath(appArray))
      .pipe(ngAnnotate())
      .pipe(concat('cdf-app.js'))
      // .pipe(uglify()) // Commented out until we figure it out why it's breaking
      .pipe(gulp.dest(relativePath('./web/public/dist/')))
  );
});

gulp.task('build', ['clean', 'build-less', 'build-dependencies'], () => {
  const appArray = Array.from(app);
  cdfApp.forEach((appLocal) => {
    appArray.push(`!${appLocal}`);
  });
  return (
    gulp
      .src(relativePath(appArray))
      .pipe(ngAnnotate())
      .pipe(concat('app.js'))
      // .pipe(uglify()) Commented out until we figure it out why it's breaking
      .pipe(gulp.dest(relativePath('./web/public/dist/')))
  );
});

gulp.task('watch-less', ['build-cdf'], () =>
  gulp.watch(
    [
      relativePath('./web/public/css/**/*.less'),
      relativePath('./web/public/js/directives/**/*.less'),
    ],
    ['build-less'],
  ),
);

gulp.task('dev', ['watch-less'], () => {
  nodemon({
    ignore: [relativePath('./web/public/components/*')],
    script: 'index.js',
    ext: 'js dust json',
  });
});

gulp.task('default', ['lint', 'jshint', 'build-cdf']);
