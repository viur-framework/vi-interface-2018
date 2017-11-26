// Project data

var appURL = 'http://www.viur.is';
var appName = 'My App';
var appDescription = 'This is my application';

var developerName = 'Mausbrand Infosys';
var developerURL = 'http://mausbrand.de/';

var backgroundColor = '#fff'; // Background color of app icons.

var srcpaths = {
  less: './less/**/*.less',
  images: './images/**/*',
  icons: './embedsvg/icons/**/*',
  logos: './embedsvg/logos/**/*',
  meta: './meta/*'
};

var destpaths = {
  css: '../appengine/static/css',
  html: '../appengine/html',
  index: '../appengine/html/index.html',
  webfonts: '../appengine/static/webfonts',
  images: '../appengine/static/images',
  embedsvg: '../appengine/html/embedsvg',
  meta: '../appengine/static/meta'
};

// Variables and requirements

const gulp = require('gulp');
const rename = require('gulp-rename');

const less = require('gulp-less');
const path = require('path');

const postcss = require('gulp-postcss');
const zindex = require('postcss-zindex');
const autoprefixer = require('gulp-autoprefixer');
const focus = require('postcss-focus');
const nocomments = require('postcss-discard-comments');
const nano = require('gulp-cssnano');
const jmq = require('gulp-join-media-queries');

const svgmin = require('gulp-svgmin');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const cheerio = require('gulp-cheerio');

const favicons = require('gulp-favicons');

// compilation and postproduction of LESS to CSS
gulp.task('css', function () {
    var processors = [
    	nocomments, // discard comments
    	focus, // add focus to hover-states
    	zindex, // reduce z-index values
    ];
    return gulp.src('./less/viur.less')
        .pipe(less({
      		paths: [ path.join(__dirname, 'less', 'includes') ]
    	})) // compile less to css
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        })) // add vendor prefixes
		.pipe(postcss(processors)) // clean up css
		.pipe(jmq({
			log: true
		}))
        .pipe(gulp.dest(destpaths.css)) // save cleaned version
        .pipe(nano()) // minify css
        .pipe(rename('style.min.css')) // save minified version
    	.pipe(gulp.dest(destpaths.css));
});

// reduce images for web
gulp.task('images', function () {
  return gulp.src(srcpaths.images)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(destpaths.images));
});

gulp.task ('icons', function () {
	return gulp.src(srcpaths.icons)
	.pipe(imagemin({
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]
	}))
    .pipe(cheerio({
      run: function ($, file) {
        $('style').remove()
        $('[id]').removeAttr('id')
        //$('[class]').removeAttr('class')
        $('[fill]').removeAttr('fill')
        $('svg').addClass('icon')
      },
      parserOptions: {xmlMode: true}
    }))
	.pipe(rename({prefix: "icon-"}))
	.pipe(gulp.dest(destpaths.embedsvg));
});

// crop and resize one meta image to different favicon formats.
gulp.task('meta', function () {
  return gulp.src(srcpaths.meta)
    .pipe(favicons({
      appName: appName,
      appDescription: appDescription,
      developerName: developerName,
      developerURL: developerURL,
      background: backgroundColor,
      path: destpaths.meta,
      url: appURL,
      display: "standalone",
      orientation: "portrait",
      version: 1.0,
      logging: false,
      online: false,
      html: destpaths.index,
      replace: true
    }))
    .pipe(gulp.dest(destpaths.meta));
});

gulp.task('watch', function () {
   gulp.watch(srcpaths.less, ['css']);
   gulp.watch(srcpaths.icons, ['icons']);
   gulp.watch(srcpaths.images, ['images']);
   gulp.watch(srcpaths.meta, ['meta']);
});

gulp.task('default', ['css', 'images', 'icons', 'meta']);
