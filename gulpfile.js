'use strict';

const gulp = require('gulp');

//gulp-notify Плагин уведомлений

//const pag = require('gulp-pag'); // Компиллятор sass файлов
const sass = require('gulp-sass'); // Компиллятор sass файлов
const sassGlob = require('gulp-sass-glob'); // @import
const groupMediaQueries = require('gulp-group-css-media-queries'); // Группировка медиа-запросов
const cleanCSS = require('gulp-cleancss'); // Минимизация стилей CSS

const concat = require('gulp-concat'); // Модуль для склеивания css файлов
const uglify = require('gulp-uglify'); // Модуль для минификации js файлов 
const babel = require('gulp-babel'); // Модуль для преобразования файлов ES6 в ES5 формат	

const rename = require('gulp-rename'); // Модуль для переименования файлов
const sourcemaps = require('gulp-sourcemaps'); // В инспекторе мы знаем нужный файл и нужную строку для правки кода
const replace = require('gulp-replace'); // Замена в файлах строк
const del = require('del'); // Модуль для удаления папок и файлов
const plumber = require('gulp-plumber'); // Формирует вывод об ошибке. Но при этом работа Gulp не прерывается
const gutil = require('gulp-util'); // Модуль утилит 

const browserSync = require('browser-sync').create(); // Модуль для синхронизации с браузером

//const ftp = require('vinyl-ftp');                  // Модуль для работы по ftp
//const useref = require('gulp-useref');             // Модуль для конкатенации стилей и скриптов через парсинг спец. блоков 
//const autoprefixer = require('gulp-autoprefixer'); // Модуль для управления браузерными префиксами 
//const uncss = require('gulp-uncss');               // Модуль для оптимизации css файлов, на основе использования в html 
const imagemin = require('gulp-imagemin');           // Модуль для сжатия изображений  
const ghPages = require('gulp-gh-pages');

const paths = {
    src: './src/', // paths.src
    build: './build/' // paths.build
};

function styles() {
    return gulp.src(paths.src + 'scss/main.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sassGlob())
        .pipe(sass()) // { outputStyle: 'compressed' }  //.pipe(sass().on('error', sass.logError))
        .pipe(groupMediaQueries())
        //.pipe(cleanCSS())
        //.pipe(rename({ suffix: ".min" }))
        .pipe(sourcemaps.write('/'))
        .pipe(gulp.dest(paths.build + 'css/'))
        .pipe(browserSync.stream())
}

function htmls() {
    return gulp.src(paths.src + '*.html')
        .pipe(plumber())
        //.pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))
        .pipe(gulp.dest(paths.build));
}

function vendor_styles() {
    return gulp.src(paths.src + 'vendor-css/**/*.css')
        .pipe(plumber())
        // .pipe(sourcemaps.init())
        // .pipe(sourcemaps.write('/'))
        .pipe(gulp.dest(paths.build + 'vendor-css/'))
}

function scripts() {
    return gulp.src(paths.src + 'js/**/*.js')
        .pipe(plumber())
        // .pipe(babel({  
        //   presets: ['env'] //Дает ошибку при сборке
        // }))
        //.pipe(uglify())   
        // .pipe(concat('script.min.js'))
        .pipe(gulp.dest(paths.build + 'js/'))
        .pipe(browserSync.stream())
}

function imgs() {
    return gulp.src(paths.src + 'img/**/*.*')
        .pipe(plumber())
        .pipe(imagemin())
        .pipe(gulp.dest(paths.build + 'img/'))
        //.pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
}

function icons() {
    return gulp.src(paths.src + 'icons/**/*.*')
        .pipe(plumber())
        .pipe(gulp.dest(paths.build + 'icons/'))
}

function fonts() {
    return gulp.src(paths.src + 'fonts/**/*.*')
        .pipe(plumber())
        .pipe(gulp.dest(paths.build + 'fonts/'))
}

function clean() {
    return del('build/')
}

function watch() {
    gulp.watch(paths.src + 'scss/**/*.scss', styles);
    gulp.watch(paths.src + 'vendor-css/**/*.css', vendor_styles);
    gulp.watch(paths.src + 'js/**/*.js', scripts);
    gulp.watch(paths.src + '*.html', htmls);
    gulp.watch(paths.src + 'icons/**/*.*', icons);
    gulp.watch(paths.src + 'img/**/*.*', imgs);
    gulp.watch(paths.src + 'fonts/**/*.*', fonts);   
}

function serve() {
    browserSync.init({
        notify: false,
        port: 9000,
        open: true,
        server: {
            baseDir: paths.build
        }
    });
    browserSync.watch(paths.build + '**/*.*', browserSync.reload);
}

gulp.task('deploy', function() {
  // accessToken = '[Bish1Kek97]';
  // repoName='grawl/[my repo name]';	//git@github.com:Expromtum/Burgers.git
  return gulp.src(paths.build + '**/*')
    .pipe(ghPages({
       remoteUrl: "https://github.com/Expromtum/expromtum.github.io",
        // remoteUrl: 'https://grawl:' + accessToken + '@github.com/' + repoName + '.git'
        branch: "gh-pages",
        force: false
    }));
});

// exports.styles = styles;
// exports.vendor_styles = vendor_styles;
// exports.scripts = scripts;
// exports.htmls = htmls;
// exports.clean = clean;
// exports.watch = watch;

gulp.task('build', gulp.series(
    clean,
    gulp.parallel(styles, scripts, htmls, vendor_styles, fonts, imgs, icons)
));

gulp.task('clean', gulp.series(
    clean
));

gulp.task('serve', gulp.series(
    serve
));


gulp.task('default', gulp.series(
    clean,
    gulp.parallel(styles, scripts, htmls, vendor_styles, fonts, imgs, icons),
    gulp.parallel(watch, serve)
));