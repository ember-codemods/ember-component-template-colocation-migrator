// @ts-check

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const {
  getLayoutNameTemplates,
  getPartialTemplates,
  getImportedTemplates,
} = require('./utils/templates');
const { moveFile, removeDirs } = require('./utils/file');
const { transform: dropLayoutBinding } = require('./utils/rewrite-imports');
const { template } = require('jscodeshift');

/**
 * @typedef {object} Options
 * @property {string} projectRoot
 * @property {'flat' | 'nested'} structure
 */

module.exports = class Migrator {
  /**
   * @param {Options} options
   */
  constructor({ projectRoot, structure }) {
    /** @type {string} */
    this.projectRoot = projectRoot;

    /** @type {'flat' | 'nested'} */
    this.structure = structure;
  }

  get appRoot() {
    return path.join(this.projectRoot, 'app');
  }

  get addonRoot() {
    return path.join(this.projectRoot, 'addon');
  }

  get appTemplatesDir() {
    return path.join(this.appRoot, 'templates');
  }

  get addonTemplatesDir() {
    return path.join(this.addonRoot, 'templates');
  }

  get appComponentTemplatesDir() {
    return path.join(this.appTemplatesDir, 'components');
  }

  get addonComponentTemplatesDir() {
    return path.join(this.addonTemplatesDir, 'components');
  }

  get appBackingClassesDir() {
    return path.join(this.appRoot, 'components');
  }

  get addonBackingClassesDir() {
    return path.join(this.addonRoot, 'components');
  }

  findComponentTemplates() {
    return glob.sync(
      `{${this.appComponentTemplatesDir},${this.addonComponentTemplatesDir}}/**/*.hbs`
    );
  }

  findComponentClasses() {
    return glob.sync(`{${this.appBackingClassesDir},${this.addonBackingClassesDir}}/**/*.{js,ts}`);
  }

  findAllTemplates() {
    return glob.sync(
      `{${this.appBackingClassesDir},${this.appTemplatesDir},${this.addonBackingClassesDir},${this.addonTemplatesDir}}/**/*.hbs`
    );
  }

  /**
   * @param {string[]} templateFilePaths
   * @param {string[]} componentsWithLayoutName
   */
  skipTemplatesUsedAsLayoutName(templateFilePaths, componentsWithLayoutName) {
    console.info(
      `\nChecking if any component templates are used as templates of other components using \`layoutName\``
    );

    if (componentsWithLayoutName.length) {
      componentsWithLayoutName.sort().forEach((component) => {
        console.info(`❌ Did not move '${component}' due to usage as "layoutName" in a component`);
      });

      templateFilePaths = templateFilePaths.filter((templateFilePath) => {
        // Extract '/(app|addon)/templates/components/nested1/nested-component.hbs'
        const filePathFromApp = templateFilePath.slice(this.projectRoot.length);

        const type = typeFromFilePath(filePathFromApp);

        // Extract '/components/nested1/nested-component.hbs'
        const filePathFromAppTemplates = filePathFromApp.slice(`${type}/templates/`.length);

        // Extract 'components/nested1/nested-component'
        const classFilePath = filePathFromAppTemplates.slice(1).replace('.hbs', '');

        return !componentsWithLayoutName.includes(classFilePath);
      });
    }

    return templateFilePaths;
  }

  /**
   * @param {string[]} templateFilePaths
   */
  skipTemplatesUsedAsPartial(templateFilePaths) {
    console.info(`\nChecking if any component templates are used as partials`);

    const componentsWithPartial = getPartialTemplates(this.findAllTemplates());

    if (componentsWithPartial.length) {
      componentsWithPartial.sort().forEach((component) => {
        console.info(`❌ Did not move '${component}' due to usage as a "partial"`);
      });

      templateFilePaths = templateFilePaths.filter((templateFilePath) => {
        // Extract '/(app|addon)/templates/components/nested1/nested-component.hbs'
        let filePathFromApp = templateFilePath.slice(this.projectRoot.length);

        /*
          When Ember sees `{{partial "foo"}}`, it will look for the template in
          two locations:

          - `app/templates/foo.hbs`
          - `app/templates/-foo.hbs`

          If `filePathFromApp` matches the latter pattern, we remove the hyphen. 
        */
        if (/\/\-[\w\-]+\.hbs/.test(filePathFromApp)) {
          filePathFromApp = filePathFromApp.replace('/-', '/');
        }

        const type = typeFromFilePath(filePathFromApp);

        // Extract '/components/nested1/nested-component.hbs'
        const filePathFromAppTemplates = filePathFromApp.slice(`${type}/templates/`.length);

        // Extract 'components/nested1/nested-component'
        const classFilePath = filePathFromAppTemplates.slice(1).replace('.hbs', '');

        return !componentsWithPartial.includes(classFilePath);
      });
    }

    return templateFilePaths;
  }

  /**
   * @param {string[]} templateFilePaths
   * @returns {string[]}
   */
  skipTemplatesUsedInMultipleBackingClasses(templateFilePaths) {
    console.info('\nChecking if any component templates are used in multiple backing classes');

    const componentFilePaths = this.findComponentClasses();
    const componentsImportingTemplates = getImportedTemplates(
      componentFilePaths,
      templateFilePaths
    );

    const allowed = new Map();
    const reusedTemplates = new Map();
    for (let component of componentsImportingTemplates) {
      const { backingClassPath, importedTemplates } = component;

      // Map the imported template name back to the template file paths as we
      // have them on
      const importedTemplate = importedTemplates[0].replace(/.*\/templates/gi, 'templates');

      const template = templateFilePaths.find((path) => path.includes(importedTemplate));

      // If we've previously put this in the "allowed" bucket, we now know it
      // *shouldn't* be allowed, because it's used in another
      const previouslyAllowed = allowed.get(template);
      if (previouslyAllowed) {
        allowed.delete(template);
        reusedTemplates.set(template, [previouslyAllowed, backingClassPath]);
        break;
      }

      const previouslyReused = reusedTemplates.get(template);
      if (previouslyReused) {
        previouslyReused.push(backingClassPath);
        break;
      }

      allowed.set(template, backingClassPath);
    }

    for (let [templatePath, importingModules] of reusedTemplates.entries()) {
      const importingModuleLocalPaths = importingModules.map((path) =>
        path.replace(/.*\/(app|addon)/, '')
      );

      const message =
        `❌ Did not move '${templatePath}' because it was imported by ` +
        'multiple components:\n\t' +
        importingModuleLocalPaths.join('\n\t');

      console.info(message);
    }

    const nonImported = templateFilePaths.filter(
      (path) => !allowed.has(path) && !reusedTemplates.has(path)
    );

    return Array.from(allowed.keys()).concat(nonImported);
  }

  /**
   * @param {string[]} templateFilePaths
   */
  changeComponentStructureToFlat(templateFilePaths) {
    templateFilePaths.forEach((templateFilePath) => {
      // Extract '/(app|addon)/templates/components/nested1/nested-component.hbs'
      const filePathFromApp = templateFilePath.slice(this.projectRoot.length);

      const type = typeFromFilePath(filePathFromApp);

      // Extract '/nested1/nested-component.hbs'
      const filePathFromAppTemplatesComponents = filePathFromApp.slice(
        `${type}/templates/components/`.length
      );

      // '[APP_PATH]/(app|addon)/components/nested1/nested-component.hbs'
      const root = type === 'app' ? this.appRoot : this.addonRoot;
      const newTemplateFilePath = path.join(root, 'components', filePathFromAppTemplatesComponents);
      moveFile(templateFilePath, newTemplateFilePath);
    });
  }

  /**
   * @param {string[]} templateFilePaths
   */
  changeComponentStructureToNested(templateFilePaths) {
    const classFilePaths = this.findComponentClasses();

    templateFilePaths.forEach((templateFilePath) => {
      // Extract '/(app|addon)/templates/components/nested1/nested-component.hbs'
      const filePathFromProject = templateFilePath.slice(this.projectRoot.length);

      const type = typeFromFilePath(filePathFromProject);

      // Extract '/nested1/nested-component.hbs'
      const filePathFromAppTemplatesComponents = filePathFromProject.slice(
        `${type}/templates/components/`.length
      );
      const fileExtension = path.extname(filePathFromAppTemplatesComponents);

      // Extract '/nested1/nested-component'
      const targetPath = filePathFromAppTemplatesComponents.slice(0, -fileExtension.length);

      // Build '[APP_PATH]/(app|addon)/components/nested1/nested-component/index.hbs'
      const root = type === 'app' ? this.appRoot : this.addonRoot;
      const newTemplateFilePath = path.join(root, 'components', targetPath, 'index.hbs');
      moveFile(templateFilePath, newTemplateFilePath);

      // Build '[APP_PATH]/(app|addon)/components/nested1/nested-component/index.js'
      const classFilePath = {
        js: path.join(root, 'components', `${targetPath}.js`),
        ts: path.join(root, 'components', `${targetPath}.ts`),
      };

      if (classFilePaths.includes(classFilePath.js)) {
        const newClassFilePath = path.join(root, 'components', targetPath, 'index.js');
        moveFile(classFilePath.js, newClassFilePath);
      } else if (classFilePaths.includes(classFilePath.ts)) {
        const newClassFilePath = path.join(root, 'components', targetPath, 'index.ts');
        moveFile(classFilePath.ts, newClassFilePath);
      }
    });
  }

  /**
   * @param {string[]} templateFilePaths
   */
  removeLayoutBinding(templateFilePaths) {
    templateFilePaths.forEach((templateFilePath) => {
      // Extract '/(app|addon)/templates/components/nested1/nested-component.hbs'
      const filePathFromProject = templateFilePath.slice(this.projectRoot.length);

      const backingJsClassProjectPath = filePathFromProject
        .replace('templates/components', 'components')
        .replace('.hbs', '.js');

      const backingTsClassProjectPath = filePathFromProject
        .replace('templates/components', 'components')
        .replace('.hbs', '.ts');

      const backingClassPaths = [
        backingJsClassProjectPath,
        backingTsClassProjectPath,
      ].map((backingClassPath) => path.join(this.projectRoot, backingClassPath));

      backingClassPaths.forEach((path) => {
        if (fs.existsSync(path)) {
          const existingContent = fs.readFileSync(path, { encoding: 'utf-8' });
          const updatedContent = dropLayoutBinding(existingContent);
          if (existingContent !== updatedContent) {
            fs.writeFileSync(path, updatedContent);
          }
        }
      });
    });
  }

  async removeEmptyClassicComponentDirectories() {
    const classFilePaths = this.findComponentClasses();
    const templatesWithLayoutName = getLayoutNameTemplates(classFilePaths);

    const componentFilePaths = this.findComponentClasses();
    const componentsImportingTemplates = getImportedTemplates(
      componentFilePaths,
      this.findComponentTemplates()
    );

    const removeOnlyEmptyDirectories = Boolean(
      templatesWithLayoutName.length + componentsImportingTemplates.length
    );

    await removeDirs(this.appComponentTemplatesDir, removeOnlyEmptyDirectories);
    await removeDirs(this.addonComponentTemplatesDir, removeOnlyEmptyDirectories);
  }

  async execute() {
    const classFilePaths = this.findComponentClasses();
    const componentsWithLayoutName = getLayoutNameTemplates(classFilePaths);

    let templateFilePaths = this.findComponentTemplates();
    templateFilePaths = this.skipTemplatesUsedAsLayoutName(
      templateFilePaths,
      componentsWithLayoutName
    );
    templateFilePaths = this.skipTemplatesUsedAsPartial(templateFilePaths);
    templateFilePaths = this.skipTemplatesUsedInMultipleBackingClasses(templateFilePaths);

    this.removeLayoutBinding(templateFilePaths);

    if (this.structure === 'flat') {
      this.changeComponentStructureToFlat(templateFilePaths);
    } else if (this.structure === 'nested') {
      this.changeComponentStructureToNested(templateFilePaths);
    }

    // Clean up
    await this.removeEmptyClassicComponentDirectories();
  }
};

/**
 * Determine whether the file path represents an app or an addon
 * @param {string} filePathFromApp
 * @return {'app' | 'addon'}
 */
function typeFromFilePath(filePathFromApp) {
  if (filePathFromApp.startsWith('/app')) {
    return 'app';
  } else if (filePathFromApp.startsWith('/addon')) {
    return 'addon';
  } else {
    throw new Error(`invalid file path: ${filePathFromApp}`);
  }
}
