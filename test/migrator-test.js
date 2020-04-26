// inspired by https://github.com/ember-codemods/ember-module-migrator/blob/master/test/engines/classic-test.js

var path = require("path");
var assert = require("power-assert");
var assertDiff = require('assert-diff');
var fixturify = require("fixturify");
var fse = require("fs-extra");
var Migrator = require('../lib/migrator');

assertDiff.options.strict = true;

describe("Migrator", function() {
  var tmpPath = "tmp/process-files";
  var fixturesPath = path.resolve(__dirname, "fixtures");

  beforeEach(function() {
    fse.mkdirsSync(tmpPath);
  });

  afterEach(function() {
    fse.removeSync(tmpPath);
  });

  var entries = fse.readdirSync(fixturesPath);

  entries.forEach(async function(entry) {
    it(`should migrate ${entry} fixture properly`, async function() {
      var fixturePath = path.join(fixturesPath, entry);
      var input = require(fixturePath + "/input");
      var expected = require(fixturePath + "/output");
      var migratorConfig = {};
      try {
        migratorConfig = require(fixturePath + "/config");
      } catch (e) {
        // fixture uses default config...
      }

      fixturify.writeSync(tmpPath, input);

      var migratorOptions = Object.assign(
        {
          projectRoot: tmpPath,
          newComponentStructure: 'flat'
        },
        migratorConfig
      );

      var migrator = new Migrator(migratorOptions);
      await migrator.execute();

      var actual = fixturify.readSync(tmpPath);
      assertDiff.deepEqual(actual, expected, "the codemod should work as expected");

      await migrator.execute();
      assertDiff.deepEqual(actual, expected, "the codemod should be idempotent");
    });
  });
});

