module.exports = {
  demo: {
    lint: ['lib/**/*.js'],
    build: {
      source: 'media-recorder.js',
      bundle: {
        entries: ['./lib/media-recorder.js'],
        standalone: 'Recorder',
        noParse: ['jquery', 'underscore', 'recorderjs', 'webrtc-adapter'],
      },
    },
    dest: 'demo',
    vendor: {
      source: 'vendor.js',
    },
    assets: [
      {
        src: ['lib/swf/*'],
        options: { base: 'lib/swf' },
        dest: '',
      },
    ],
    browserSync: {
      dev: {
        port: 3000,
        https: true,
        server: {
          baseDir: ['demo'],
        },
      },
      files: ['demo/*.js', 'demo/*.html', 'demo/*.css'],
    },
    watch: [
      {
        files: ['lib/**/*.js'],
        tasks: ['build:demo'],
      },
    ],
  },
  test: {
    mocha: {
      file: './test/support/setup.js',
      reporter: 'nyan',
    },
  },
}
