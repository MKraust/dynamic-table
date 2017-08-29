'use strict';

var gulp        = require('gulp'),
    babel       = require('gulp-babel'),
    watch       = require('gulp-watch'), // Для наблюдения за изменениями файлов
    prefixer    = require('gulp-autoprefixer'), // Автоматически добавляет вендорные префиксы к CSS свойствам
    uglify      = require('gulp-uglify'), // Сжатие JS кода
    sass        = require('gulp-sass'), // Для компиляции SCSS кода
    sourcemaps  = require('gulp-sourcemaps'), // Для генерации sourcemaps, которые помогут при отладке
    rigger      = require('gulp-rigger'), // Позволяет импортировать один файл в другой простой конструкцией    //= footer.html
    cssmin      = require('gulp-clean-css'), // Сжатие CSS кода
    imagemin    = require('gulp-imagemin'), // Сжатие картинок
    pngquant    = require('imagemin-pngquant'), // Дополнение к предыдущему плагину, для работы с PNG
    rimraf      = require('rimraf'), // rm -rf для ноды
    browserSync = require('browser-sync'), // Разворачивает локальный сервер с блэкджеком и LiveReload
    reload      = browserSync.reload;


// JS объект, в котором содержатся все нужные пути, чтобы при необходимости легко в одном месте их редактировать
var path = {

    // Тут мы указываем куда складывать готовые после сборки файлы
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },

    // Пути, откуда брать исходники
    src: {
        html: 'src/*.html', // Синтаксис src/*.html говорит gulp, что мы хотим взять ВСЕ файлы с расширением .html
        js: 'src/js/main.js', // В стилях и скриптах понадобятся только main файлы
        style: 'src/style/main.scss',
        img: 'src/img/**/*.*', // Синтаксис img/**/*.* означает, что мы берем ВСЕ файлы ВСЕХ расширений из ВСЕХ папок, вложенных в img
        fonts: 'src/fonts/**/*.*'
    },

    // Тут мы указываем, за изменением каких файлов мы хотим наблюдать
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },

    clean: './build'
};

// Переменная с настройками dev сервера
var config = {
    server: {
        baseDir: './build'
    },
    tunnel: true,
    host: 'localhost',
    port: 8000,
    logPrefix: 'Frontend'
};


gulp.task('default', ['build', 'webserver', 'watch']);


// Cборка HTML
gulp.task('html:build', function () {
    gulp.src(path.src.html) // Выбираем файлы по нужному пути
        .pipe(rigger()) // Прогоняем через rigger
        .pipe(gulp.dest(path.build.html)) // Выплёвываем в папку build
        .pipe(reload({stream: true})); // Перезагружаем наш сервер для обновлений
});

// Сборка Javascript
gulp.task('js:build', function () {
    gulp.src(path.src.js) // Находим файл
        .pipe(rigger()) // Прогоняем через rigger
        .pipe(sourcemaps.init()) // Инициализируем sourcemap
        .pipe(babel({presets: ['env']}))
        .pipe(uglify()) // Сжимаем JS
        .pipe(sourcemaps.write()) // Прописываем карты
        .pipe(gulp.dest(path.build.js)) // Выплёвываем готовый файл в build
        .pipe(reload({stream: true})); // Перезагружаем сервер
});

gulp.task('libs:build', function () {
    gulp.src('bower_components/jquery/dist/jquery.slim.min.js')
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

/*
    Вся идея тут состоит в том, чтобы с помощью rigger'a инклюдить в main.js все нужные нам js файлы в нужном порядке.
    Именно ради контроля над порядком подключения это и делается именно так, вместо того чтобы попросить gulp
    найти все *.js файлы и склеить их.

    Часто, при поиске места ошибки приходится по очереди выключать какие-то файлы из сборки, чтобы локализовать место проблемы.
    В случае если бездумно склеивать все .js файлы, то дебаг будет усложнен.
*/


// Сборка SCSS
gulp.task('style:build', function () {
    gulp.src(path.src.style) // Выбираем наш main.scss
        .pipe(sourcemaps.init()) // То же самое, что и с js
        .pipe(sass()) // Компилируем
        .pipe(prefixer()) // Добавляем вендорные префиксы
        .pipe(cssmin()) // Сжимаем
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css)) // И в build
        .pipe(reload({stream: true}));
});


// Сборка картинок
gulp.task('img:build', function () {
    gulp.src(path.src.img) // Выбираем картинки
        .pipe(imagemin({ // Шакалим
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) // Кидаем в build
        .pipe(reload({stream: true}));
});


// Сборка шрифтов
gulp.task('fonts:build', function () {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});


gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'img:build',
    'libs:build'
]);


// Чтобы не лазить все время в консоль, нужно попросить gulp каждый раз при изменении какого-то файлы запускать нужную задачу
gulp.task('watch', function () {
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('img:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});


gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});
