module.exports = {
  addon: {
    'app.js': '// app',

    components: {
      // A standalone component
      'top-level-component': {
        'index.hbs': '{{!-- top-level-component.hbs --}}',
        'index.js': '// top-level-component.js',
      },

      // A template-only component
      'template-only-component': {
        'index.hbs': '{{!-- template-only-component.hbs --}}',
      },

      // A nested component
      'parent-component': {
        'index.hbs': '{{!-- parent-component.hbs --}}',
        'index.js': '// parent-component.js',
        'child-component': {
          'index.hbs': '{{!-- parent-component/child-component.hbs --}}',
          'index.js': '// parent-component/child-component.js',
          'grandchild-component': {
            'index.hbs': '{{!-- parent-component/child-component/grandchild-component.hbs --}}',
            'index.js': '// parent-component/child-component/grandchild-component.js',
          },
        },
      },

      // Another nested component
      nested1: {
        'nested-component': {
          'index.hbs': '{{!-- nested1/nested-component.hbs --}}',
          'index.js': '// nested1/nested-component.js',
        },
        nested2: {
          'super-nested-component': {
            'index.hbs': '{{!-- nested1/nested2/super-nested-component.hbs --}}',
            'index.js': '// nested1/nested2/super-nested-component.js',
          },
        },
      },

      // A component with layoutName
      'layout-name': {
        'has-layout-name.js': [
          '// top-level-component.js',
          'Component.extend({ layoutName: "components/layout-name/layout-name-template" });',
        ].join('\n'),
      },

      // A component with partial
      partials: {
        'with-partial': {
          'index.hbs': [
            '{{!-- with-partial.hbs --}}',
            '{{partial "components/partials/partial-one-template"}}',
            '{{partial "components/partials/partial-two-template"}}',
            '{{partial "components/partials/partial-three-template"}}',
          ].join('\n'),
        },
      },

      'layout-property-classic': {
        'index.js': [
          'import Component from "@ember/component";',
          'import SomeMixin from "my-addon/mixins/whatever";',
          'export default Component.extend(SomeMixin, {});',
        ].join('\n'),
        'index.hbs': '{{!-- layout-property-classic.hbs --}}',
      },

      'layout-property-native': {
        'index.js': [
          'import Component from "@ember/component";',
          'export default class NativeProperty extends Component {}',
        ].join('\n'),
        'index.hbs': '{{!-- layout-property-native.hbs --}}',
      },

      'layout-decorator': {
        'index.js': [
          'import Component from "@ember/component";',
          'export default class LayoutDecorator extends Component {}',
        ].join('\n'),
        'index.hbs': '{{!-- layout-decorator-template.hbs --}}',
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
          'layout-name-template.hbs': '{{!-- layout-name-template.hbs --}}',
        },

        // A partial template
        partials: {
          'partial-one-template.hbs': '{{!-- partial-one-template.hbs --}}',
          'partial-two-template.hbs': '{{!-- partial-two-template.hbs --}}',
          '-partial-three-template.hbs': '{{!-- partial-three-template.hbs --}}',
        },

        'repeatedly-imported.hbs': '{{!-- repeatedly-imported.hbs --}}',
      },
    },
  },
};
