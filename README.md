# webpack-stocks

webpack-stocks will gives you progress of your build but gives you stocks prices while you wait.

## Install

```bash
$ npm i webpack-stocks --save-dev
```

In your webpack.config.js

```js
// require it
const WebpackStocksPlugin = require('webpack-stocks');

const webpackConfig = {
  // ... your config
};

module.exports = webpackConfig;

// then add the plugin usually if its not prod
const env = process.env.NODE_ENV || 'development';
if (env !== 'production') {
  webpackConfig.plugins.push(
    new WebpackStocksPlugin.default() // why default? for future webpack 2.0 imports
  );
}
```

## Specify stocks

There are two ways to specify stocks

#### Use `~/.stocksrc`

Add a .stocksrc to your `$HOME` directory. Right now it supports about 6 ticker symbols. Make sure to separate them by a new line. The lookup is done by Yahoo Finance api.

Example .stocksrc
```
AAPL
JNUG
YHOO
```


#### Send as options param

```js
// in your webpack.config.js

new WebpackStocksPlugin.default({
  symbols: ['AAPL', 'JNUG', 'YHOO']
});
```
