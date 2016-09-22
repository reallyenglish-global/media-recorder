'use strict';

module.exports = {
  demo: {
    build: {
      source: 'media-recorder.js',
      bundle: {
        entries: [
          './lib/media-recorder.js'
        ],
        standalone: 'Recorder',
        noParse: [
          'jquery',
          'underscore',
          'recorderjs',
          'webrtc-adapter'
        ]
      }
    },
    dest: 'demo',
    vendor: {
      source: 'vendor.js',
    },
    assets: [
      {
        src: ['lib/swf/*'],
        options: {base: 'lib/swf'},
        dest: ''
      },
    ],
    browserSync: {
      dev: {
        port: 3000,
        server: {
          baseDir: ['demo']
        }
      },
      files: [
        "demo/*.js",
        "demo/*.html",
        "demo/*.css"
      ]
    },
    watch: [{
      files: ['lib/**/*.js'],
      tasks: ['build:demo']
    }],
  },
  test: {
    runner: 'test/runner.html',
    watch: [{
        files: ['test/**/*.spec.js', 'test/support/**/*.js', 'lib/**/*.js'],
        tasks: ['build:test']
      },
      {
        files: ['./test/spec-manifest.js'],
        tasks: ['test-runner']
      }
    ],
    build: {
      source: 'spec-manifest.js',
      bundle: {
        entries: [
          './test/lib/**/*.spec.js'
        ]
      }
    },
    vendor: {
      source: 'vendor.js',
    },
    dest: 'test'
  }
}

