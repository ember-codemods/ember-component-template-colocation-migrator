module.exports = {
  app: {
    'app.js': '// app',

    components: {
      // A standalone component
      'top-level-component': {
        'index.hbs': '{{!-- top-level-component.hbs --}}',
        'index.js': '// top-level-component.js',
      },

      // A template-only component
      'template-only-component': {
        'index.hbs': '{{!-- template-only-component.hbs --}}'
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
            'index.js': '// parent-component/child-component/grandchild-component.js'
          }
        }
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
            'index.js': '// nested1/nested2/super-nested-component.js'
          }
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
        'with-partial': {
          'index.hbs': [
            '{{!-- with-partial.hbs --}}',
            '{{partial "components/partials/partial-one-template"}}',
            '{{partial "components/partials/partial-two-template"}}',
            '{{partial "components/partials/partial-three-template"}}'
          ].join('\n')
        }
      }
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
        }
      }
    }
  },
};