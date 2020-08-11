'use strict';

const CONSOLE = Object.assign({}, console);

let consoleOutput;

function setupConsole() {
  consoleOutput = [];

  console.info = function () {
    consoleOutput.push(...arguments);
  };
}

function resetConsole() {
  Object.assign(console, CONSOLE);
  consoleOutput = undefined;
}

function getConsoleOutput() {
  return consoleOutput;
}

module.exports = {
  setupConsole,
  getConsoleOutput,
  resetConsole,
};
