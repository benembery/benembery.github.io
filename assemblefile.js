const assemble = require('assemble'),
    watch = require('base-watch'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    gutil = require('gulp-util'),
    del = require('del')
    // LESS dependendcies
    less = require('gulp-less'),
    postcss = require('gulp-postcss'),
    autoprefix = require('autoprefixer'),
    cssnano = require('cssnano'),
    cssmqp = require('css-mqpacker'),
    sourcemaps = require('gulp-sourcemaps')

const config = {
    src_less: './src/less/*.less',
    css_output_path: './assets/css'
}

function logging (err) {
    gutil.log(gutil.colors.red("Error: "+err.message))

    this.emit('end')
}


var app = assemble();
app.use(watch());

/**
 * HTML build
 */
app.task('build', () => {
    app.layouts('src/layouts/**/*.hbs');
    // define a default layout.
    app.option('layout', 'src/layouts/default.hbs');
    app.option('engine', 'consolidate')
    
    return app.src('src/pages/*.{md,hbs}')
        .pipe(app.renderFile())
        .on('err', logging)
        .pipe(rename({ extname: '.html', dirname: '' }))
        .pipe(app.dest('./'))
        .pipe(connect.reload())
})

/**
 * CSS Compilation
 */
var postcssConfig = [
    autoprefix({ browsers: ['last 2 versions'] }), 
    cssmqp({ sort: true }), 
    cssnano
]

app.task('clean:css', () => del(config.css_output_path + '/*.*'))

app.task('bundle:css', ['clean:css'], () => {
    return app.src(config.src_less)
        .pipe(sourcemaps.init())
        .pipe(less().on('error',logging))
        .pipe(postcss(postcssConfig))
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('./', { sourceRoot: '../../../less/' }))
        .pipe(app.dest(config.css_output_path))
        .pipe(connect.reload())
})

/**
 * Development Tasks
 */
app.task('webserver', (cb) => {
    connect.server({
        root: './',
        livereload: true
    })
    cb();
})

app.task('dev', ['default', 'webserver'], function () {
    app.watch('src/**/*.{md,hbs}', ['build'])
    app.watch('src/less/**/*.less', ['bundle:css'])
})

app.task('default', ['build', 'bundle:css'])

module.exports = app