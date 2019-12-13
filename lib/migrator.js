const fse = require("fs-extra");
const path = require('path');
const glob = require("glob");
const { getLayoutNameTemplates, getPartialTemplates } = require('./utils/templates')
const { moveFile, removeDirs } = require('./utils/file')

module.exports = class Migrator {
  constructor(options) {
    this.options = options;
  }

  async execute() {
    let sourceComponentTemplatesPath = path.join(this.options.projectRoot, 'app/templates/components');
    var sourceComponentTemplateFilePaths = glob.sync(`${sourceComponentTemplatesPath}/**/*.hbs`);

    let sourceComponentPath = path.join(this.options.projectRoot, 'app/components');
    let sourceComponentFilePaths = glob.sync(`${sourceComponentPath}/**/*.js`);
    let templatesWithLayoutName = getLayoutNameTemplates(sourceComponentFilePaths);
    if (templatesWithLayoutName.length) {
      sourceComponentTemplateFilePaths = sourceComponentTemplateFilePaths.filter(sourceTemplateFilePath => {
        let sourceTemplatePathInApp = sourceTemplateFilePath.slice(this.options.projectRoot.length); // '/app/templates/components/nested1/nested-component.hbs'
        let templatePath = sourceTemplatePathInApp.slice('app/templates/'.length); // '/nested1/nested-component.hbs'
        return !templatesWithLayoutName.includes(templatePath.slice(1).replace('.hbs', ''));
      });
    }

    let sourceTemplatesPath = path.join(this.options.projectRoot, 'app/templates');
    var sourceTemplateFilePaths = glob.sync(`${sourceTemplatesPath}/**/*.hbs`);
    let templatesInPartials = getPartialTemplates(sourceTemplateFilePaths);
    if (templatesInPartials.length) {
      sourceComponentTemplateFilePaths = sourceComponentTemplateFilePaths.filter(sourceTemplateFilePath => {
        let sourceTemplatePathInApp = sourceTemplateFilePath.slice(this.options.projectRoot.length); // '/app/templates/components/nested1/nested-component.hbs'
        if (/\/\-[\w\-]+\.hbs/.test(sourceTemplatePathInApp)) {
          sourceTemplatePathInApp = sourceTemplatePathInApp.replace('/-', '/');
        }
        let templatePath = sourceTemplatePathInApp.slice('app/templates/'.length); // '/nested1/nested-component.hbs'
        return !templatesInPartials.includes(templatePath.slice(1).replace('.hbs', ''));
      });
    }

    sourceComponentTemplateFilePaths.forEach(sourceTemplateFilePath => {
      let sourceTemplatePathInApp = sourceTemplateFilePath.slice(this.options.projectRoot.length); // '/app/templates/components/nested1/nested-component.hbs'
      let templatePath = sourceTemplatePathInApp.slice('app/templates/components/'.length); // '/nested1/nested-component.hbs'
      let targetTemplateFilePath = path.join(this.options.projectRoot, 'app/components', templatePath); // '[APP_PATH]/app/components/nested1/nested-component.hbs'
      moveFile(sourceTemplateFilePath, targetTemplateFilePath);
    });

    templatesWithLayoutName.sort().forEach(template => {
      console.info(`❌ Did not move '${template}' due to usage as "layoutName" in a component`);
    });
    templatesInPartials.sort().forEach(template => {
      console.info(`❌ Did not move '${template}' due to usage as a "partial"`);
    });

    let onlyRemoveEmptyDirs = Boolean(templatesWithLayoutName.length);
    await removeDirs(sourceComponentTemplatesPath, onlyRemoveEmptyDirs);
  }
}