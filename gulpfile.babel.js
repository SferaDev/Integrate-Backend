import apidoc from 'gulp-apidoc';
import gulp from 'gulp';

gulp.task('apidoc', (done) => {
    apidoc({
        src: './src/routes',
        dest: './apidoc'
    }, done);
});

gulp.task('watch', () => {
    gulp.watch(['./src/routes/**'], ['apidoc']);
});