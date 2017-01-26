const WebpackStocksPlugin = require('../lib/index');
console.log(WebpackStocksPlugin);

const plugin = new WebpackStocksPlugin.default();
plugin.onCompile();
