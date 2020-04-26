const fse = require("fs-extra");
const path = require('path');
const glob = require("glob");
const { getLayoutNameTemplates, getPartialTemplates } = require('./utils/templates')
const { moveFile, removeDirs } = require('./utils/file')

module.exports = class Migrator {
  constructor(options) {
    const { projectRoot, newComponentStructure } = options;

    this.projectRoot = projectRoot;
    this.newComponentStructure = newComponentStructure;
  }

  findClassicComponentTemplates() {
    const templateFolderPath = path.join(this.projectRoot, 'app/templates/components');
    const templateFilePaths = glob.sync(`${templateFolderPath}/**/*.hbs`);

    return templateFilePaths;
  }

  findClassicComponentClasses() {
    const classFolderPath = path.join(this.projectRoot, 'app/components');
    const classFilePaths = glob.sync(`${classFolderPath}/**/*.js`);

    return classFilePaths;
  }

  findTemplates() {
    const templateFolderPath = path.join(this.projectRoot, 'app/templates');
    const templateFilePaths = glob.sync(`${templateFolderPath}/**/*.hbs`);

    return templateFilePaths;
  }

  skipTemplatesUsedAsLayoutName(templateFilePaths) {
    console.info(`\nChecking if any component templates are used as templates of other components using \`layoutName\``);

    const classFilePaths = this.findClassicComponentClasses();
    const componentsWithLayoutName = getLayoutNameTemplates(classFilePaths);

    if (componentsWithLayoutName.length) {
      componentsWithLayoutName.sort().forEach(component => {
        console.info(`❌ Did not move '${component}' due to usage as "layoutName" in a component`);
      });

      templateFilePaths = templateFilePaths.filter(templateFilePath => {
        // Extract '/app/templates/components/nested1/nested-component.hbs'
        const filePathFromApp = templateFilePath.slice(this.projectRoot.length);

        // Extract '/components/nested1/nested-component.hbs'
        const filePathFromAppTemplates = filePathFromApp.slice('app/templates/'.length);

        // Extract 'components/nested1/nested-component'
        const classFilePath = filePathFromAppTemplates.slice(1).replace('.hbs', '');

        return !componentsWithLayoutName.includes(classFilePath);
      });
    }

    return templateFilePaths;
  }

  skipTemplatesUsedAsPartial(templateFilePaths) {
    console.info(`\nChecking if any component templates are used as partials`);

    const componentsWithPartial = getPartialTemplates(this.findTemplates());

    if (componentsWithPartial.length) {
      componentsWithPartial.sort().forEach(component => {
        console.info(`❌ Did not move '${component}' due to usage as a "partial"`);
      });

      templateFilePaths = templateFilePaths.filter(templateFilePath => {
        // Extract '/app/templates/components/nested1/nested-component.hbs'
        let filePathFromApp = templateFilePath.slice(this.projectRoot.length);

        if (/\/\-[\w\-]+\.hbs/.test(filePathFromApp)) {
          filePathFromApp = filePathFromApp.replace('/-', '/');
        }

        // Extract '/components/nested1/nested-component.hbs'
        const filePathFromAppTemplates = filePathFromApp.slice('app/templates/'.length);

        // Extract 'components/nested1/nested-component'
        const classFilePath = filePathFromAppTemplates.slice(1).replace('.hbs', '');

        return !componentsWithPartial.includes(classFilePath);
      });
    }

    return templateFilePaths;
  }

  changeComponentStructureToFlat(templateFilePaths) {
    templateFilePaths.forEach(templateFilePath => {
      // Extract '/app/templates/components/nested1/nested-component.hbs'
      const filePathFromApp = templateFilePath.slice(this.projectRoot.length);

      // Extract '/nested1/nested-component.hbs'
      const filePathFromAppTemplatesComponents = filePathFromApp.slice('app/templates/components/'.length);

      // '[APP_PATH]/app/components/nested1/nested-component.hbs'
      const newTemplateFilePath = path.join(this.projectRoot, 'app/components', filePathFromAppTemplatesComponents);
      moveFile(templateFilePath, newTemplateFilePath);
    });
  }

  async removeEmptyClassicComponentDirectories() {
    const templateFolderPath = path.join(this.projectRoot, 'app/templates/components');

    const classFilePaths = this.findClassicComponentClasses();
    const templatesWithLayoutName = getLayoutNameTemplates(classFilePaths);
    const removeOnlyEmptyDirectories = Boolean(templatesWithLayoutName.length);
 
    await removeDirs(templateFolderPath, removeOnlyEmptyDirectories);
  }

  async execute() {
    let templateFilePaths = this.findClassicComponentTemplates();
    templateFilePaths = this.skipTemplatesUsedAsLayoutName(templateFilePaths);
    templateFilePaths = this.skipTemplatesUsedAsPartial(templateFilePaths);

    if (this.newComponentStructure === 'flat') {
      this.changeComponentStructureToFlat(templateFilePaths);
    }

    // Clean up
    await this.removeEmptyClassicComponentDirectories();
  }
}