module.exports = {
  addon: {
    'app.js': '// app',

    components: {
      // A standalone component
      'top-level-component.js': '// top-level-component.js',

      // A nested component
      'parent-component.js': '// parent-component.js',
      'parent-component': {
        'child-component.js': '// parent-component/child-component.js',
        'child-component': {
          'grandchild-component.js': '// parent-component/child-component/grandchild-component.js',
        },
      },

      // Another nested component
      nested1: {
        'nested-component.js': '// nested1/nested-component.js',
        nested2: {
          'super-nested-component.js': '// nested1/nested2/super-nested-component.js',
        },
      },

      // A component with layoutName
      'layout-name': {
        'has-layout-name.js': [
          '// top-level-component.js',
          'Component.extend({ layoutName: "components/layout-name/layout-name-template" });',
        ].join('\n'),
      },

      'layout-property-classic.js': [
        'import Component from "@ember/component";',
        'import layout from "my-addon/templates/components/layout-property-classic";',
        'import SomeMixin from "my-addon/mixins/whatever";',
        'export default Component.extend(SomeMixin, {',
        '  layout,',
        '});',
      ].join('\n'),

      'layout-property-native.js': [
        'import Component from "@ember/component";',
        'import layout from "my-addon/templates/components/layout-property-native";',
        'export default class NativeProperty extends Component {',
        '  layout = layout;',
        '}',
      ].join('\n'),

      'layout-decorator.js': [
        'import Component from "@ember/component";',
        'import { layout } from "@ember-decorators/component";',
        'import template from "my-addon/templates/components/layout-decorator";',
        '@layout(template)',
        'export default class LayoutDecorator extends Component {}',
      ].join('\n'),

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
        // A standalone component
        'top-level-component.hbs': '{{!-- top-level-component.hbs --}}',

        // A template-only component
        'template-only-component.hbs': '{{!-- template-only-component.hbs --}}',

        // A nested component
        'parent-component.hbs': '{{!-- parent-component.hbs --}}',
        'parent-component': {
          'child-component.hbs': '{{!-- parent-component/child-component.hbs --}}',
          'child-component': {
            'grandchild-component.hbs':
              '{{!-- parent-component/child-component/grandchild-component.hbs --}}',
          },
        },

        // Another nested component
        nested1: {
          'nested-component.hbs': '{{!-- nested1/nested-component.hbs --}}',
          nested2: {
            'super-nested-component.hbs': '{{!-- nested1/nested2/super-nested-component.hbs --}}',
          },
        },

        // A component with layoutName
        'layout-name': {
          'layout-name-template.hbs': '{{!-- layout-name-template.hbs --}}',
        },

        // A partial template
        partials: {
          'partial-one-template.hbs': '{{!-- partial-one-template.hbs --}}',
          'partial-two-template.hbs': '{{!-- partial-two-template.hbs --}}',
          '-partial-three-template.hbs': '{{!-- partial-three-template.hbs --}}',

          'with-partial.hbs': [
            '{{!-- with-partial.hbs --}}',
            '{{partial "components/partials/partial-one-template"}}',
            '{{partial "components/partials/partial-two-template"}}',
            '{{partial "components/partials/partial-three-template"}}',
          ].join('\n'),
        },

        'layout-property-classic.hbs': '{{!-- layout-property-classic.hbs --}}',
        'layout-property-native.hbs': '{{!-- layout-property-native.hbs --}}',
        'layout-decorator.hbs': '{{!-- layout-decorator-template.hbs --}}',

        'repeatedly-imported.hbs': '{{!-- repeatedly-imported.hbs --}}',
      },
    },
  },
};
