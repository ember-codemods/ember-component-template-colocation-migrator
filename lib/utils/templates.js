const { readFileSync } = require('fs');
const JSParser = require('./js-parser');
const jsTraverse = require('@babel/traverse').default;
const { parse, traverse } = require('ember-template-recast');

function getLayoutNameTemplates(files) {
  let names = files
    .map((file) => {
      let content = readFileSync(file, 'utf8');
      return fileInLayoutName(content);
    })
    .filter(Boolean);
  return Array.from(new Set(names));
}

function fileInLayoutName(content) {
  let ast = JSParser.parse(content);
  let layoutName;
  jsTraverse(ast, {
    ClassProperty: function (path) {
      if (path.node.key.name === 'layoutName') {
        layoutName = path.node.key.value.value;
        path.stop();
      }
    },
    Property: function (path) {
      if (path.node.key.name === 'layoutName') {
        layoutName = path.node.value.value;
        path.stop();
      }
    },
  });
  return layoutName;
}

function getPartialTemplates(files) {
  let names = files
    .reduce((acc, file) => {
      let content = readFileSync(file, 'utf8');
      let partials = filesInPartials(content);
      return partials.length ? acc.concat(partials) : acc;
    }, [])
    .filter(Boolean)
    .filter((path) => path.startsWith('components/'));
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

/**
 * Get a
 * @param {string[]} componentPaths
 * @param {string[]} templatePaths
 * @return {Array<{ backingClassPath: string, importedTemplates: string[]]>}
 */
function getImportedTemplates(componentPaths, templatePaths) {
  let pathsForComparison = templatePaths.map((path) =>
    path.replace(/.*\/templates/gi, 'templates').replace('.hbs', '')
  );

  return (
    componentPaths
      // load the contents of each backing class, preserving its original file
      // path so it can be used in later steps.
      .map((path) => [path, readFileSync(path, { encoding: 'utf8' })])
      // Then parse each file's contents into an AST to search through.
      .map(([path, contents]) => [path, JSParser.parse(contents)])
      // Then traverse the backing class's AST for imports matching any of the
      // known template paths.
      .map(([path, ast]) => ({
        backingClassPath: path,
        importedTemplates: importedTemplates(ast, pathsForComparison),
      }))
      // Finally, get rid of any component paths which didn't have any  matches,
      // since we only care about components which *do* import the templates.
      .filter(({ importedTemplates }) => importedTemplates.length > 0)
  );
}

/**
 * @param {File} ast
 * @param {string[]} templatePaths
 * @returns {string[]}
 */
function importedTemplates(ast, templatePaths) {
  /** @type {string[]} */
  let templatesImportedInAst = [];

  jsTraverse(ast, {
    ImportDeclaration(path) {
      const { value } = path.node.source;
      if (templatePaths.find((path) => value.includes(path))) {
        templatesImportedInAst.push(value);
      }
    },
  });

  return templatesImportedInAst;
}

module.exports = {
  getLayoutNameTemplates,
  getPartialTemplates,
  getImportedTemplates,
};
