// Include gulp
var gulp = require('gulp');

 // Define base folders
var src = 'app/';
var dest = 'dist/';

 // Include plugins
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    del = require('del'),
    sass = require('gulp-sass'),
    cssurls = require('gulp-css-url-adjuster'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    preprocess = require('gulp-preprocess'),
    plumber = require('gulp-plumber'),
    opn = require('opn'),
    livereload = require('gulp-livereload'),
    autoprefixer = require('gulp-autoprefixer'),
    useref = require('gulp-useref'),
    mainBowerFiles = require('main-bower-files'),
    gulpFilter = require('gulp-filter');



 // Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src(src + 'js/*.js')
      .pipe(concat('main.js'))
        .pipe(gulp.dest(dest + 'js'))
        .pipe(livereload());
});

 // Copy over bower libs
gulp.task('main-bower-files', function() {
    var filterJS = gulpFilter('**/*.js', { restore: true });
    return gulp.src(mainBowerFiles({
      overrides: {
        bootstrap: {
          main: [
            'dist/js/bootstrap.js'
          ]
        }
      }
    }), { base: 'bower_components' })
          .pipe(filterJS)
          .pipe(uglify())
          .pipe(filterJS.restore)
          .pipe(gulp.dest(src + 'js'))
          .pipe(gulp.dest(dest + 'js'));
});


 // Compile CSS from Sass files
gulp.task('styles', function() {
    gulp.src(src + 'styles/scss/**/*.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest(src + 'styles/css'))
        .pipe(livereload());
});

// Optimize Images
 gulp.task('images', function() {
  return gulp.src(src + 'images/**/*')
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest(dest + 'images/'));
});


// Copy assets to build folder
gulp.task('copy', ['fonts'], function () {
  return gulp.src([
      src + '*.{png,ico,xml}'
    ])
    .pipe(gulp.dest(dest));
});
  // Copy fonts
gulp.task('fonts', function() {
  return gulp.src(src + 'fonts/**/*')
    .pipe(gulp.dest(dest + 'fonts'));
});


// Compile HTML for ease of template use
gulp.task('preprocess', function (done) {
  gulp.src(src + 'layouts/**/*.html')
    .pipe(preprocess())
    .pipe(livereload())
    .pipe(gulp.dest(src));

  done();
});

// Compile HTML with new paths for dist
gulp.task('html', ['styles'], function () {
  return gulp.src(src + '*.html')
    .pipe(useref())
    .pipe(gulp.dest(dest));
});


 // Dist path updates
gulp.task('distpaths', ['styles', 'copy', 'html'], function () {
  return gulp.src([
      dest + 'css/main.css'
    ])
    .pipe(cssurls({
      replace:  ['../../', '../'],
    }))
    .pipe(gulp.dest(dest + 'css'));
});


 // Start webserver
gulp.task('connect', ['styles'], function () {
  var serveStatic = require('serve-static'),
    serveIndex = require('serve-index');

  var app = require('connect')()
    .use(require('connect-livereload')({ port: 35729}))
    .use(serveStatic('app'))
    .use(serveIndex('app'));

  require('http').createServer(app)
    .listen(8080)
    .on('listening', function () {
      console.log('Started connect server on http://localhost:8080');
    });
});


 // Automatically open browser
gulp.task('serve', ['preprocess', 'watch'], function () {
  require('opn')('http://localhost:8080');
});

// Watch for changes
gulp.task('watch', ['connect'], function () {
  livereload.listen();
  gulp.watch([
    src + 'styles/css/**/*.css',
    src + 'scripts/**/*.js',
    src + 'images/**/*.{jpg, gif, png, svg}'
    ]);
  gulp.watch(src + 'styles/**/*.scss', ['styles']);
  gulp.watch([
    src + 'layouts/**/*.html',
    src + 'modules/**/*.html'
  ], ['preprocess']);
});


// Clean the destination folder
gulp.task('clean', function (done) {
  require('del')([dest], done);
});

 // Default Task
gulp.task('default', ['main-bower-files', 'scripts', 'styles', 'html', 'images', 'serve']);


// Build Task (RUN 'gulp clean' BEFORE)
gulp.task('build', ['preprocess', 'main-bower-files', 'scripts', 'html', 'images', 'distpaths'], function () {
  return gulp.src('dist/**/*')
});
