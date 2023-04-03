import gulp from 'gulp'
import csso from 'gulp-csso'
import include from 'gulp-file-include'
import htmlmin from 'gulp-htmlmin'
import sync from 'browser-sync'
import { deleteAsync } from 'del'
import concat from 'gulp-concat'
import autoPrefixer from 'gulp-autoprefixer'
import chokidar from 'chokidar'
import dartSass from 'gulp-dart-sass'
import uglify from 'gulp-uglify'

const { series, parallel, src, dest, task } = gulp

// Сборка HTML
task('html', async () => {
	src('./src/**.html')
		.pipe(
			include({
				prefix: '@@',
			})
		)
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(dest('dist'))
})

// Сборка, автопрефиксы, минификация SCSS
task('scss', async () => {
	return src('./src/**/**.scss')
		.pipe(dartSass().on('error', dartSass.logError))
		.pipe(
			autoPrefixer({
				cascade: false,
			})
		)
		.pipe(csso())
		.pipe(concat('index.css'))
		.pipe(dest('dist'))
})

// Сборка JS
task('js', async () => {
	return (
		src('./src/scripts/**.js')
			.pipe(concat('script.js'))
			// .pipe(uglify())
			.pipe(dest('dist'))
	)
})

// Очистка build папки
task('clear', () => {
	return deleteAsync('dist')
})

// Дефолтная таска
task('default', series('clear', parallel('html', 'scss', 'js')))

// Watch
const watch = () => {
	sync.init({
		server: {
			baseDir: 'dist',
		},
		reloadOnRestart: false,
	})

	chokidar
		.watch('./src/**/*', {
			ignoreInitial: true,
		})
		.on('all', (event, path) => {
			console.log(`File ${path} has been ${event}`)
			series('html', 'scss', 'js')()
			sync.reload()
		})
}

task('watch', watch)
