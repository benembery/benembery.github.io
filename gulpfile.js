/// <binding BeforeBuild='default' />
/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/
'use strict'

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    rename = require('gulp-rename'),
    del = require('del'),
    // LESS dependendcies
    less = require('gulp-less'),
    postcss = require('gulp-postcss'),
    autoprefix = require('autoprefixer'),
    cssnano = require('cssnano'),
    cssmqp = require('css-mqpacker'),
    sourcemaps = require('gulp-sourcemaps'),
    assembler = require('./src/assemblefile')

var config = {
    src_less: './assets_src/less/*.less',
    css_output_path: './assets/css'
}

gulp.task('assemble', () => {
    return assembler.build((err) => {
        if (err) 
            throw err
        
        gutil.log(gutil.colors.green("✔ assemble complete"))
    })
})

gulp.task('default', ['bundle:css'])

gulp.task('clean:css', () => del(config.css_output_path+'/*.*'))

gulp.task('bundle:css', ['clean:css'], function () {
    return gulp.src([config.src_less])
            .on('error', mapError)
            .pipe(sourcemaps.init())
            .pipe(less())
            .pipe(postcss([autoprefix({ browsers: ['last 2 versions'] }), cssmqp({ sort: true }), cssnano]))
            .pipe(rename({ suffix: '.min' }))
            .pipe(sourcemaps.write('./', { sourceRoot: '../../assets_src/less/' }))
            .pipe(gulp.dest(config.css_output_path))
})

gulp.task('set-dev', function() {
    process.env.NODE_ENV = 'development'
})


gulp.task('webserver', function() {
    var connect = require('gulp-connect')
    connect.server()
})

gulp.task('dev', ['webserver'], () => {
    gulp.watch(['src/pages/*.*', 'src/layouts/*.*'], ['assemble'])
    gulp.watch(config.src_less, gulp.series('clean:css','bundle:css'))
})


function isProduction() {
    return process.env.NODE_ENV === 'production'
}

function mapError(err) {
    var msg = ''

    if (err.type) {
        msg = '\n' + gutil.colors.red(err.type + ' ' + err.name + ': ')

        if (err.message) {
            msg += gutil.colors.red(err.message + '\n')
        }

        msg += gutil.colors.white(err.filename.split('assets\\')[1]) +
            gutil.colors.gray(' line: ', err.lineNumber, ' col: ', (err.columnNumber || err.column), '\n') +
            gutil.colors.cyan(err.extract.join(gutil.colors.magenta('\n')) + '\n')

    }
    else {
        msg = gutil.colors.red('Error: ' + err.message) + '\n' + gutil.colors.gray(err)
    }

    gutil.log(msg)

    if (isProduction())
        process.exit(1)

    this.emit('end')
}