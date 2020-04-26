module.exports = {
  app: {
    'app.js': '// app',
    components: {
      'top-level-component.js': '// top-level-component.js',
      nested1: {
        'nested-component.js': '// nested1/nested-component.js',
        nested2: {
          'super-nested-component.js': '// nested1/nested2/super-nested-component.js',
        }
      },
      'layout-name': {
        'has-layout-name.js': `// top-level-component.js
        Component.extend({ layoutName: "components/layout-name/layout-name-template" });`,
      }
    },
    templates: {
      'application.hbs': '{{outlet}}',
      components: {
        'top-level-component.hbs': '{{!-- top-level-component.hbs --}}',
        nested1: {
          'nested-component.hbs': '{{!-- nested1/nested-component.hbs --}}',
          nested2: {
            'super-nested-component.hbs': '{{!-- nested1/nested2/super-nested-component.hbs --}}'
          }
        },
        'layout-name': {
          'layout-name-template.hbs': '{{!-- layout-name-template.hbs --}}',
        },
        'partials': {
          'partials-template.hbs': '{{!-- partials-template.hbs --}}',
          'with-partial.hbs': `{{!-- with-partial.hbs --}}
          {{partial 'components/partials/partials-template'}}`,
        }
      }
    }
  },
};