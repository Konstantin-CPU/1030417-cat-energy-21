const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("gulp-csso");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const rename = require("gulp-rename");
const del = require("del");
const htmlmin = require("gulp-htmlmin");
const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");
const sync = require("browser-sync").create();

// Styles

const styles = () => {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(rename("style.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(sourcemap.write("."))
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

const html = () => {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("build"))
    .pipe(sync.stream());
}

exports.html = html;

//Images

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.mozjpeg({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
}

exports.images = images;

//webp

const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img"));
}

exports.createWebp = createWebp;

//Sprite

const sprite = () => {
  return gulp.src("source/img/icons/icon-*.svg")
   .pipe(svgstore({
     inlineSvg: true
   }))
   .pipe(rename("sprite.svg"))
   .pipe(gulp.dest("build/img/icons"));
}

exports.sprite = sprite;

//Copy

const copy = () => {
  return gulp.src([
    "source/fonts/*.{woff,woff2}",
    "source/*.ico",
    "source/img/**/*.{jpg,png,svg}"
  ], {
    base : "source"
  })
  .pipe(gulp.dest("build"));
}

exports.copy = copy;

//Clear

const clean = () => {
  return del("build");
}

exports.clean = clean;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series("styles"));
  gulp.watch("source/*.html", gulp.series("html"));
}

//Build

const build = gulp.series (
  clean,
  sprite,
  styles,
  html,
  copy,
  images,
  createWebp
)

exports.build = build;

exports.default = gulp.series(
  build,
  server,
  watcher
);
