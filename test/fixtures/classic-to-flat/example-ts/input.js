module.exports = {
  app: {
    'app.js': '// app',

    components: {
      // A standalone component
      'top-level-component.ts': '// top-level-component.ts',

      // A nested component
      'parent-component.ts': '// parent-component.ts',
      'parent-component': {
        'child-component.ts': '// parent-component/child-component.ts',
        'child-component': {
          'grandchild-component.ts': '// parent-component/child-component/grandchild-component.ts'
        }
      },

      // Another nested component
      nested1: {
        'nested-component.ts': '// nested1/nested-component.ts',
        nested2: {
          'super-nested-component.ts': '// nested1/nested2/super-nested-component.ts'
        }
      },

      // A component with layoutName
      'layout-name': {
        'has-layout-name.ts': [
          '// top-level-component.ts',
          'Component.extend({ layoutName: "components/layout-name/layout-name-template" });'
        ].join('\n')
      }
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
            'grandchild-component.hbs': '{{!-- parent-component/child-component/grandchild-component.hbs --}}'
          }
        },

        // Another nested component
        nested1: {
          'nested-component.hbs': '{{!-- nested1/nested-component.hbs --}}',
          nested2: {
            'super-nested-component.hbs': '{{!-- nested1/nested2/super-nested-component.hbs --}}'
          }
        },

        // A component with layoutName
        'layout-name': {
          'layout-name-template.hbs': '{{!-- layout-name-template.hbs --}}'
        },

        // A partial template
        'partials': {
          'partial-one-template.hbs': '{{!-- partial-one-template.hbs --}}',
          'partial-two-template.hbs': '{{!-- partial-two-template.hbs --}}',
          '-partial-three-template.hbs': '{{!-- partial-three-template.hbs --}}',

          'with-partial.hbs': [
            '{{!-- with-partial.hbs --}}',
            '{{partial "components/partials/partial-one-template"}}',
            '{{partial "components/partials/partial-two-template"}}',
            '{{partial "components/partials/partial-three-template"}}'
          ].join('\n')
        }
      }
    }
  }
};