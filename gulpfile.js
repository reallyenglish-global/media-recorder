const gulp = require('gulp')
const tasks = require('rels-gulp')

tasks(gulp)
gulp.task('default', gulp.series('test'))
