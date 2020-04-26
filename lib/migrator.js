const fse = require("fs-extra");
const path = require('path');
const glob = require("glob");
const { getLayoutNameTemplates, getPartialTemplates } = require('./utils/templates')
const { moveFile, removeDirs } = require('./utils/file')

module.exports = class Migrator {
  constructor(options) {
    const { projectRoot } = options;

    this.projectRoot = projectRoot;
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

  async removeEmptyClassicComponentDirectories(removeOnlyEmptyDirectories) {
    const templateFolderPath = path.join(this.projectRoot, 'app/templates/components');
 
    await removeDirs(templateFolderPath, removeOnlyEmptyDirectories);
  }

  async execute() {
    let templateFilePaths = this.findClassicComponentTemplates();
    let classFilePaths = this.findClassicComponentClasses();

    templateFilePaths = this.skipTemplatesUsedAsLayoutName(templateFilePaths);


    let sourceTemplateFilePaths = this.findTemplates();
    let templatesInPartials = getPartialTemplates(sourceTemplateFilePaths);
    if (templatesInPartials.length) {
      templateFilePaths = templateFilePaths.filter(sourceTemplateFilePath => {
        let sourceTemplatePathInApp = sourceTemplateFilePath.slice(this.projectRoot.length); // '/app/templates/components/nested1/nested-component.hbs'
        if (/\/\-[\w\-]+\.hbs/.test(sourceTemplatePathInApp)) {
          sourceTemplatePathInApp = sourceTemplatePathInApp.replace('/-', '/');
        }
        let templatePath = sourceTemplatePathInApp.slice('app/templates/'.length); // '/nested1/nested-component.hbs'
        return !templatesInPartials.includes(templatePath.slice(1).replace('.hbs', ''));
      });
    }

    templateFilePaths.forEach(sourceTemplateFilePath => {
      let sourceTemplatePathInApp = sourceTemplateFilePath.slice(this.projectRoot.length); // '/app/templates/components/nested1/nested-component.hbs'
      let templatePath = sourceTemplatePathInApp.slice('app/templates/components/'.length); // '/nested1/nested-component.hbs'
      let targetTemplateFilePath = path.join(this.projectRoot, 'app/components', templatePath); // '[APP_PATH]/app/components/nested1/nested-component.hbs'
      moveFile(sourceTemplateFilePath, targetTemplateFilePath);
    });


    const templatesWithLayoutName = getLayoutNameTemplates(classFilePaths);

    templatesInPartials.sort().forEach(template => {
      console.info(`❌ Did not move '${template}' due to usage as a "partial"`);
    });

    const removeOnlyEmptyDirectories = Boolean(templatesWithLayoutName.length);
    await this.removeEmptyClassicComponentDirectories(removeOnlyEmptyDirectories);
  }
}