var expect = require('expect.js');
var extractViews = require('../index');
var gulp = require('gulp');
var assert = require('stream-assert');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

describe("mithril reload plugin", function () {

    it("shall add one more file to pipe", function (done) {
        gulp.src([__dirname + "/suite1/file1.js"])
            .pipe(assert.length(1))
            .pipe(extractViews())
            .pipe(assert.length(2))
            .pipe(assert.end(done));
    });
    it("shall name that file st8less.js by default", function (done) {
        gulp.src(__dirname + "/suite1/file1.js")
            .pipe(extractViews())
            .pipe(assert.second(function (d) {
                expect(d.path).to.eql("st8less.js");
            }))
            .pipe(assert.end(done));
    });
    it("shall use name from options", function (done) {
        gulp.src(__dirname + "/suite1/file1.js")
            .pipe(extractViews({scriptName: "aaa.js"}))
            .pipe(assert.second(function (d) {
                expect(d.path).to.eql("aaa.js");
            }))
            .pipe(assert.end(done));

    });
    it("shall inject script into first file by default", function (done) {
        gulp.src(__dirname + "/suite1/file1.js")
            .pipe(extractViews({scriptName: "aaa.js", dest: "js/lib", injectPath: "/scripts"}))
            .pipe(assert.first(function (d) {
                var injected = d.contents.toString().split("\n")[0];
                expect(injected).to.match(/scripts\/aaa\.js/);
            }))
            .pipe(assert.end(done));
    });
    function firstLine(file) {
        return file.contents.toString().split("\n")[0];
    }
    it("shall not inject script into first file if specified in options", function (done) {
        gulp.src(__dirname + "/suite1/file1.js")
            .pipe(extractViews({scriptName: "aaa.js", dest: "js/lib", inject: false}))
            .pipe(assert.first(function (d) {
                expect(firstLine(d)).to.not.match(/aaa\.js/);
            }))
            .pipe(assert.end(done));
    });



    it("using with browserify", function (done) {
        var m = extractViews().browserify;
        browserify([__dirname + "/suite2/file1.js"])
            .transform(m.transform())
            .bundle()
            .pipe(source('index.js'))
            .pipe(buffer())
            .pipe(assert.length(1))
            .pipe(assert.first(function (d) {
                expect(firstLine(d)).to.not.match(/st8less\.js/);
            }))
            .pipe(m.inject())
            .pipe(assert.length(2))
            .pipe(assert.first(function (d) {
                expect(firstLine(d)).to.match(/st8less\.js/);
            }))
            .pipe(assert.second(function (d) {
                expect(d.path).to.eql("st8less.js");
            }))
            .pipe(assert.end(done));
    });
});
