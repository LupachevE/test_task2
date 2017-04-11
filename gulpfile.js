/**
 * Created by Lupachev on 11.04.2017.
 */
var gulp = require('gulp');
var DEST = "./build/";
gulp.task('build', ['html', 'css', 'js']);

gulp.task( 'html', function(){
    return gulp
        .src( '*.html' )
        .pipe( gulp.dest( DEST ));
});

gulp.task( 'css', function(){
    return gulp
        .src( './css/*.css' )
        .pipe( gulp.dest( DEST + '/css' ));
});

gulp.task( 'js', function( callback ){
    return gulp
        .src( './js/*.js' )
        .pipe( gulp.dest( DEST + '/js' ));
});

gulp.task('default', ['build']);