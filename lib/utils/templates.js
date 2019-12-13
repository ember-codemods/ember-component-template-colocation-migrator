const { readFileSync } = require('fs');
const JSParser = require('./js-parser');
const jsTraverse = require('@babel/traverse').default;
const { parse, traverse } = require('ember-template-recast');

function getLayoutNameTemplates(files) {
  console.info(`Checking if any component templates are used as templates of other components using \`layoutName\``);
  let names = files.map(file => {
    let content = readFileSync(file, 'utf8');
    return fileInLayoutName(content);
  }).filter(Boolean);
  return Array.from(new Set(names));
}

function fileInLayoutName(content) {
  let ast = JSParser.parse(content);
  let layoutName;
  jsTraverse(ast, {
    ClassProperty: function(path) {
      if (path.node.key.name === 'layoutName') {
        layoutName = path.node.key.value.value;
        path.stop();
      }
    },
    Property: function(path) {
      if (path.node.key.name === 'layoutName') {
        layoutName = path.node.value.value;
        path.stop();
      }
    },
  });
  return layoutName;
}

function getPartialTemplates(files) {
  console.info(`Checking if any component templates are used as partials`);
  let names = files.reduce((acc, file) => {
    let content = readFileSync(file, 'utf8');
    let partials = filesInPartials(content);
    return partials.length ? acc.concat(partials) : acc;
  }, [])
  .filter(Boolean)
  .filter(path => path.startsWith('components/'))
  return Array.from(new Set(names));
}

function filesInPartials(content) {
  let partials = [];
  const ast = parse(content);
  traverse(ast, {
    MustacheStatement(node) {
      if (node.path.original === 'partial') {
        partials.push(node.params[0].value);
      }
    },
  });
  return partials;
}

module.exports = {
  getLayoutNameTemplates,
  getPartialTemplates
}