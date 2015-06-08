var gulp = require('gulp');
var babel = require('gulp-babel');
var mocha = require('gulp-mocha');
var path = require('path');
var rimraf = require('rimraf');
 

gulp.task('build-test-files', function (done) {
	return gulp.src('*.js')
		.pipe(babel({ stage: 0 }))
		.pipe(gulp.dest('.tests'));
});

gulp.task('run-tests', ['build-test-files'], function(done){
	return gulp.src('.tests/**/*.spec.js')
		.pipe(mocha({ reporter : 'spec' }));
});

gulp.task('cleanup-test-files', ['run-tests'], function(done){
	rimraf(path.join(__dirname, '.tests'), done);
});

gulp.task('test', ['cleanup-test-files']);

gulp.task('default', function(){
	gulp.watch('*.js', ['test']);
});