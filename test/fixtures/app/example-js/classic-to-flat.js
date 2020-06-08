module.exports = {
  app: {
    'app.js': '// app',

    components: {
      // A standalone component
      'top-level-component.hbs': '{{!-- top-level-component.hbs --}}',
      'top-level-component.js': '// top-level-component.js',

      // A template-only component
      'template-only-component.hbs': '{{!-- template-only-component.hbs --}}',

      // A nested component
      'parent-component.hbs': '{{!-- parent-component.hbs --}}',
      'parent-component.js': '// parent-component.js',
      'parent-component': {
        'child-component.hbs': '{{!-- parent-component/child-component.hbs --}}',
        'child-component.js': '// parent-component/child-component.js',
        'child-component': {
          'grandchild-component.hbs': '{{!-- parent-component/child-component/grandchild-component.hbs --}}',
          'grandchild-component.js': '// parent-component/child-component/grandchild-component.js'
        }
      },

      // Another nested component
      nested1: {
        'nested-component.hbs': '{{!-- nested1/nested-component.hbs --}}',
        'nested-component.js': '// nested1/nested-component.js',
        nested2: {
          'super-nested-component.hbs': '{{!-- nested1/nested2/super-nested-component.hbs --}}',
          'super-nested-component.js': '// nested1/nested2/super-nested-component.js'
        }
      },

      // A component with layoutName
      'layout-name': {
        'has-layout-name.js': [
          '// top-level-component.js',
          'Component.extend({ layoutName: "components/layout-name/layout-name-template" });'
        ].join('\n')
      },

      // A component with partial
      'partials': {
        'with-partial.hbs': [
          '{{!-- with-partial.hbs --}}',
          '{{partial "components/partials/partial-one-template"}}',
          '{{partial "components/partials/partial-two-template"}}',
          '{{partial "components/partials/partial-three-template"}}'
        ].join('\n')
      },

      // A template imported into multiple component classes
      'first-repeated-import.js': [
        '// first-repeated-import.js',
        'import Component from "@ember/component"',
        'import { layout } from "@ember-decorators/component";',
        'import template from "my-addon/templates/components/repeatedly-imported";',
        '@layout(template)',
        'export default class FirstRepeatedImport extends Component {}',
      ].join('\n'),
      'second-repeated-import.js': [
        '// second-repeated-import.js',
        'import Component from "@ember/component"',
        'import { layout } from "@ember-decorators/component";',
        'import template from "my-addon/templates/components/repeatedly-imported";',
        '@layout(template)',
        'export default class SecondRepeatedImport extends Component {}',
      ].join('\n'),
    },

    templates: {
      'application.hbs': '{{outlet}}',

      components: {
        // A component with layoutName
        'layout-name': {
          'layout-name-template.hbs': '{{!-- layout-name-template.hbs --}}'
        },

        // A partial template
        'partials': {
          'partial-one-template.hbs': '{{!-- partial-one-template.hbs --}}',
          'partial-two-template.hbs': '{{!-- partial-two-template.hbs --}}',
          '-partial-three-template.hbs': '{{!-- partial-three-template.hbs --}}'
        },

        'repeatedly-imported.hbs': '{{!-- repeatedly-imported.hbs --}}',
      }
    }
  },
};