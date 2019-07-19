var fse = require("fs-extra");
var path = require('path');
var glob = require("glob");

function moveFile(sourceFilePath, targetFilePath) {
  let targetFileDirectory = path.dirname(targetFilePath);
  if (!fse.existsSync(targetFileDirectory)) {
    console.info(`📁 Creating ${targetFileDirectory}`);
    fse.mkdirSync(targetFileDirectory, { recursive: true })
  }

  console.info(`👍 Moving ${sourceFilePath} -> ${targetFilePath}`);
  fse.renameSync(sourceFilePath, targetFilePath);
}

module.exports = class Migrator {
  constructor(options) {
    this.options = options;
  }

  async execute() {
    let sourceComponentTemplatesPath = path.join(this.options.projectRoot, 'app/templates/components');
    var sourceTemplateFilePaths = glob.sync(`${sourceComponentTemplatesPath}/**/*.hbs`);

    sourceTemplateFilePaths.forEach(sourceTemplateFilePath => {
      let sourceTemplatePathInApp = sourceTemplateFilePath.slice(this.options.projectRoot.length); // '/app/templates/components/nested1/nested-component.hbs'
      let templatePath = sourceTemplatePathInApp.slice('app/templates/components/'.length); // '/nested1/nested-component.hbs'
      let targetTemplateFilePath = path.join(this.options.projectRoot, 'app/components', templatePath); // '[APP_PATH]/app/components/nested1/nested-component.hbs'
      moveFile(sourceTemplateFilePath, targetTemplateFilePath);
    });

    await fse.remove(sourceComponentTemplatesPath);
  }
}