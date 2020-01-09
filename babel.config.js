const config = {
  presets: [
    [
      '@babel/preset-env',
      {
        debug: false,
        targets: {
          browsers: [
            'Explorer 11',
            'last 1 Chrome versions',
            'last 1 FireFox versions',
            'last 1 Safari versions',
            'last 1 Edge versions',
          ],
        },
        useBuiltIns: 'usage',
        corejs: {
          version: '3',
          proposals: 'true',
        },
      },
    ],
  ],
}

const cache = process.env.CI !== true
require('@babel/register')({ ...config, cache })

module.exports = config
