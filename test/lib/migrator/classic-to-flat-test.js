const assertDiff = require('assert-diff');
const fixturify = require('fixturify');
const fse = require('fs-extra');
const path = require('path');
const Migrator = require('../../../lib/migrator');

assertDiff.options.strict = true;

describe('structure = flat', function() {
  beforeEach(function() {
    this.tmpPath = 'tmp/process-files';
    fse.mkdirsSync(this.tmpPath);
  });

  afterEach(function() {
    fse.removeSync(this.tmpPath);
  });


  describe('For an app with component classes written in JavaScript', function() {
    beforeEach(function() {
      const fixturePath = path.resolve(__dirname, '../../fixtures/app/example-js');

      // Find input and output files
      const input = require(`${fixturePath}/input`);
      this.expectedOutput = require(`${fixturePath}/classic-to-flat`);

      // Copy the input file to the temporary folder
      fixturify.writeSync(this.tmpPath, input);

      // Create an instance of the Migrator class
      this.migrator = new Migrator({
        projectRoot: this.tmpPath,
        structure: 'flat'
      });
    });


    it('Codemod works as expected', async function() {
      await this.migrator.execute();

      const actualOutput = fixturify.readSync(this.tmpPath);

      assertDiff.deepEqual(actualOutput, this.expectedOutput);
    });


    it('Codemod is idempotent', async function() {
      await this.migrator.execute();
      await this.migrator.execute();

      const actualOutput = fixturify.readSync(this.tmpPath);

      assertDiff.deepEqual(actualOutput, this.expectedOutput);
    });
  });


  describe('For an app with component classes written in TypeScript', function() {
    beforeEach(function() {
      const fixturePath = path.resolve(__dirname, '../../fixtures/app/example-ts');

      // Find input and output files
      const input = require(`${fixturePath}/input`);
      this.expectedOutput = require(`${fixturePath}/classic-to-flat`);

      // Copy the input file to the temporary folder
      fixturify.writeSync(this.tmpPath, input);

      // Create an instance of the Migrator class
      this.migrator = new Migrator({
        projectRoot: this.tmpPath,
        structure: 'flat'
      });
    });


    it('Codemod works as expected', async function() {
      await this.migrator.execute();

      const actualOutput = fixturify.readSync(this.tmpPath);

      assertDiff.deepEqual(actualOutput, this.expectedOutput);
    });


    it('Codemod is idempotent', async function() {
      await this.migrator.execute();
      await this.migrator.execute();

      const actualOutput = fixturify.readSync(this.tmpPath);

      assertDiff.deepEqual(actualOutput, this.expectedOutput);
    });
  });

  describe('For an addon with component classes written in JavaScript', function() {
    beforeEach(function() {
      const fixturePath = path.resolve(__dirname, '../../fixtures/addon/example-js');

      // Find input and output files
      const input = require(`${fixturePath}/input`);
      this.expectedOutput = require(`${fixturePath}/classic-to-flat`);

      // Copy the input file to the temporary folder
      fixturify.writeSync(this.tmpPath, input);

      // Create an instance of the Migrator class
      this.migrator = new Migrator({
        projectRoot: this.tmpPath,
        structure: 'flat'
      });
    });


    it('Codemod works as expected', async function() {
      await this.migrator.execute();

      const actualOutput = fixturify.readSync(this.tmpPath);

      assertDiff.deepEqual(actualOutput, this.expectedOutput);
    });


    it('Codemod is idempotent', async function() {
      await this.migrator.execute();
      await this.migrator.execute();

      const actualOutput = fixturify.readSync(this.tmpPath);

      assertDiff.deepEqual(actualOutput, this.expectedOutput);
    });
  });


  describe('For an addon with component classes written in TypeScript', function() {
    beforeEach(function() {
      const fixturePath = path.resolve(__dirname, '../../fixtures/addon/example-ts');

      // Find input and output files
      const input = require(`${fixturePath}/input`);
      this.expectedOutput = require(`${fixturePath}/classic-to-flat`);

      // Copy the input file to the temporary folder
      fixturify.writeSync(this.tmpPath, input);

      // Create an instance of the Migrator class
      this.migrator = new Migrator({
        projectRoot: this.tmpPath,
        structure: 'flat'
      });
    });


    it('Codemod works as expected', async function() {
      await this.migrator.execute();

      const actualOutput = fixturify.readSync(this.tmpPath);

      assertDiff.deepEqual(actualOutput, this.expectedOutput);
    });


    it('Codemod is idempotent', async function() {
      await this.migrator.execute();
      await this.migrator.execute();

      const actualOutput = fixturify.readSync(this.tmpPath);

      assertDiff.deepEqual(actualOutput, this.expectedOutput);
    });
  });
});