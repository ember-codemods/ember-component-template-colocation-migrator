const fse = require("fs-extra");
const path = require('path');
const removeDirectories = require('remove-empty-directories');

function moveFile(sourceFilePath, targetFilePath) {
  let targetFileDirectory = path.dirname(targetFilePath);
  if (!fse.existsSync(targetFileDirectory)) {
    console.info(`📁 Creating ${targetFileDirectory}`);
    fse.mkdirSync(targetFileDirectory, { recursive: true })
  }

  console.info(`👍 Moving ${sourceFilePath} -> ${targetFilePath}`);
  fse.renameSync(sourceFilePath, targetFilePath);
}

async function removeDirs(dirPath, removeOnlyEmptyDirectories = false) {
  if (removeOnlyEmptyDirectories) {
    removeDirectories(dirPath);
  } else {
    await fse.remove(dirPath)
  }
}

module.exports = {
  moveFile,
  removeDirs
}