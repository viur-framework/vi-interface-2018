// Project data

var appURL = 'http://www.viur.is';
var appName = 'My App';
var appDescription = 'This is my application';

var developerName = 'Mausbrand Infosys';
var developerURL = 'http://mausbrand.de/';

var backgroundColor = '#020307'; // Background color of app icons.

var srcpaths = {
  less: './less/**/*.less',
  icons: './icons/**/*.svg',
  images: './images/**/*',
  meta: './meta/*'
};

var destpaths = {
  css: '../appengine/static/css',
  html: '../appengine/html',    
  index: '../appengine/html/index.html',
  webfonts: '../appengine/static/webfonts',
  images: '../appengine/static/images',
  meta: '../appengine/static/meta',
};

// Variables and requirements

var gulp = require('gulp');
var rename = require('gulp-rename');

var less = require('gulp-less');
var path = require('path');

var postcss = require('gulp-postcss');
var zindex = require('postcss-zindex');
var autoprefixer = require('gulp-autoprefixer');
var focus = require('postcss-focus');
var nocomments = require('postcss-discard-comments');
var nano = require('gulp-cssnano');

var stylelint = require('stylelint');
var stylelintConfig = require('stylelint-config-standard'); 

var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var rename = require('gulp-rename');
var inject = require('gulp-inject');

var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

var favicons = require('gulp-favicons');

var psi = require('psi');
var psikey = '';

// Please feel free to use the `nokey` option to try out PageSpeed
// Insights as part of your build process. For more frequent use,
// we recommend registering for your own API key. For more info:
// https://developers.google.com/speed/docs/insights/v2/getting-started

gulp.task('mobile', function () {
    return psi(appURL, {
        // key: psikey
        nokey: 'true',
        strategy: 'mobile',
    }).then(function (data) {
        console.log('Speed score: ' + data.ruleGroups.SPEED.score);
        console.log('Usability score: ' + data.ruleGroups.USABILITY.score);
    });
});

gulp.task('desktop', function () {
    return psi(appURL, {
        nokey: 'true',
        // key: psikey,
        strategy: 'desktop',
    }).then(function (data) {
        console.log('Speed score: ' + data.ruleGroups.SPEED.score);
    });
});

gulp.task('css', function () {
    var processors = [
    	nocomments, // discard comments
    	focus, // add focus to hover-states
    	zindex, // reduce z-index values
    	autoprefixer, // add vendor prefixes
        require('stylelint')(stylelintConfig), // lint the css  
        require('postcss-font-magician')({
   			hosted: destpaths.webfonts
		}) // import fonts   
    ];
    return gulp.src('./less/viur.less')
        .pipe(less({
      		paths: [ path.join(__dirname, 'less', 'includes') ]
    	})) // compile less to css
        .pipe(postcss(processors)) // clean up css
        .pipe(gulp.dest(destpaths.css)) // save cleaned version
        .pipe(nano()) // minify css
        .pipe(rename('style.min.css')) // save minified version 
    	.pipe(gulp.dest(destpaths.css));
});

gulp.task('svgstore', function () {
	var svgs = gulp
        .src(srcpaths.icons)
        .pipe(svgmin(function (file) {
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: 'vi-',
                        minify: true
                    }
                }]
            }
        })) // clean up and minify svg
        .pipe(rename({prefix: 'vi-'})) // add vi- prefix to IDs
        .pipe(svgstore({ inlineSvg: true })); // merge all svg into one file as symbols

	function fileContents (filePath, file) {
        return file.contents.toString();
    }

	return gulp
     	.src('../appengine/html/index.html') // inject merged svg into index.html
        .pipe(inject(svgs, { transform: fileContents }))       
        .pipe(gulp.dest('../appengine/html'));
});

gulp.task ('images', function () {
	return gulp.src(srcpaths.images)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(destpaths.images));
});

gulp.task ('meta', function () {
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
   gulp.watch(srcpaths.icons, ['svgstore']);
   gulp.watch(srcpaths.images, ['images']);
   gulp.watch(srcpaths.meta, ['meta']);
});

gulp.task('default', ['css', 'svgstore', 'images', 'meta']);