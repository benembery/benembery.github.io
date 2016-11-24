var assemble = require('assemble');
var app = assemble();
var rename = require('gulp-rename');

app.pages('./src/pages/*.hbs');
app.layouts('./src/layouts/*.hbs');
app.task('default', function() {
  return app.toStream('pages')
    .pipe(app.renderFile())
    .pipe(rename({extname:'.html',dirname: '' }))
    .pipe(app.dest('./')); //<= write files to the "./site" directory 
});
 
// expose your instance of assemble to assemble's CLI 
module.exports = app;