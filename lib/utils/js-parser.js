'use strict';

const babylon = require('@babel/parser');

// These are the options that were the default of the Babel5 parse function
// see https://github.com/babel/babel/blob/5.x/packages/babel/src/api/node.js#L81
const options = {
  sourceType: 'module',
  allowHashBang: true,
  ecmaVersion: Infinity,
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  startLine: 1,
  tokens: true,
  plugins: [
    'asyncGenerators',
    'classProperties',
    'doExpressions',
    'exportExtensions',
    'functionBind',
    'functionSent',
    'objectRestSpread',
    'dynamicImport',
    'nullishCoalescingOperator',
    'optionalChaining',
    'decorators-legacy',
    'typescript',
  ],
};

module.exports = {
  parse(code) {
    return babylon.parse(code, options);
  },
};
