/** Rewrite the imports for modules we moved. */

let parser = require('recast/parsers/typescript');
const j = require('jscodeshift').withParser(parser);

function transform(source) {
  const root = j(source);

  // Start by eliminating the classic class `layout` property and corresponding
  // import of the template.
  let layoutProperty = findClassicLayout(root);
  if (layoutProperty) {
    let importDeclaration = findMatchingImport(root, layoutProperty.node.value.name);
    if (importDeclaration) {
      importDeclaration.parent.prune();
    }
    layoutProperty.prune();
  }

  // Then do the same for `layout` property set on an ES class via assignment
  // and corresponding import of the template.
  let layoutClassProperties = findClassPropertyLayout(root);
  layoutClassProperties.forEach((lcp) => {
    let importDeclaration = findMatchingImport(root, lcp.node.value.name);
    if (importDeclaration) {
      importDeclaration.parent.prune();
    }
    lcp.prune();
  });

  // Finally, remove the `layout` decorator import, its usage, and the import
  // for whatever template was used in the decorator invocation.
  let layoutDecoratorSpecifier = findLayoutDecorator(root);
  if (layoutDecoratorSpecifier) {
    let decoratorUsages = findLayoutDecoratorUsage(root, layoutDecoratorSpecifier);
    decoratorUsages.forEach((decorator) => {
      let layoutName = decorator.node.expression.arguments[0].name;
      let importDeclaration = findMatchingImport(root, layoutName);
      if (importDeclaration) {
        importDeclaration.parent.prune();
      }
      decorator.prune();
    });

    if (layoutDecoratorSpecifier.parentPath.node.specifiers.length > 1) {
      layoutDecoratorSpecifier.prune();
    } else {
      layoutDecoratorSpecifier.parentPath.parentPath.prune();
    }
  }

  return root.toSource();
}

/**
  ID `layout` properties on classic objects like this:
 
  ```js
  export default Component.extend({
    layout
  });
  ```
 */
function findClassicLayout(root) {
  let layoutProperty;

  root
    .find(j.CallExpression, {
      callee: {
        property: {
          name: 'extend',
        },
      },
    })
    .forEach((path) => {
      path.get('arguments').filter((argumentPath) => {
        if (argumentPath.node.type === 'ObjectExpression') {
          let properties = argumentPath.get('properties');
          let matches = properties.filter((p) => p.node.key.name === 'layout');

          layoutProperty = matches[0];
        }
      });
    });

  return layoutProperty;
}

/**
  ID `layout` properties on modern classes like this:
 
  ```js
  export default class MyThing extends Component {
    layout
  }
  ```
 */
function findClassPropertyLayout(root) {
  return root.find(j.ClassDeclaration).map((path) => {
    let properties = path.get('body').get('body');
    return properties.filter((p) => j.match(p, { type: 'ClassProperty', key: { name: 'layout' } }));
  });
}

/**
  ID imports with a given name -- useful for mapping back to the import for
  whatever is  bound to a given class property (whether classic or ES classes).
 */
function findMatchingImport(root, name) {
  let importPath;

  root.find(j.ImportDeclaration).forEach((importDeclaration) => {
    let specifiers = importDeclaration.get('specifiers');
    let matches = specifiers.filter((specifierPath) =>
      j.match(specifierPath, {
        type: 'ImportDefaultSpecifier',
        local: { name },
      })
    );

    if (matches[0]) {
      importPath = matches[0];
    }
  });

  return importPath;
}

/**
  ID `layout` decorator imports, since it can be renamed after importing and if
  so we need the local name. For example:
 
  ```js
  import { layout as templateLayout } from '@ember-decorators/component';
  ```
 */
function findLayoutDecorator(root) {
  let importSpecifier;

  root
    .find(j.ImportDeclaration, {
      source: { value: '@ember-decorators/component' },
    })
    .forEach((importPath) => {
      let specifiers = importPath.get('specifiers');
      let matches = specifiers.filter((specifierPath) =>
        j.match(specifierPath, { imported: { name: 'layout' } })
      );

      importSpecifier = matches[0];
    });

  return importSpecifier;
}

/**
  ID `layout` decorator imports, since it can be renamed after importing and ifn
  so we need the local name
 
  ```js
  @layout(someTemplateValue)
  export default class MyThing extends Component {
    // ...
  }
  ```
 */
function findLayoutDecoratorUsage(root, layoutDecorator) {
  return root.find(j.ClassDeclaration).map((classPath) => {
    if (classPath.node.decorators === undefined) {
      return;
    }

    let decorators = classPath.get('decorators');
    let matches = decorators.filter((decoratorPath) =>
      j.match(decoratorPath, {
        expression: {
          callee: { name: layoutDecorator.node.local.name },
        },
      })
    );

    return matches;
  });
}

module.exports = { transform };
