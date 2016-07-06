'use strict';


module.exports = {
  shared: {
    vendor: {},
    paths: {
      build: ['lib/**/*.js'],
      test: ['test/**/*.spec.js']
    },
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
    assets: [
      {
        src: ['lib/swf/*'],
        options: {base: 'lib/swf'},
        dest: ''
      },
    ],
  },
  demo: {
    watched: {
      build: ['lib/**/*.js'],
    },
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
    }
  },
  test: {
    watched: {
      specs: ['test/**/*.spec.js'],
      support: ['test/support/**/*.js'],
      build: ['lib/**/*.js'],
      manifest: ['./test/spec-manifest.js']
    },
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
