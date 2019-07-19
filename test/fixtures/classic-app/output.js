module.exports = {
  app: {
    'app.js': '// app',
    components: {
      'top-level-component.hbs': '{{!-- top-level-component.hbs --}}',
      'top-level-component.js': '// top-level-component.js',
      nested1: {
        'nested-component.hbs': '{{!-- nested1/nested-component.hbs --}}',
        'nested-component.js': '// nested1/nested-component.js',
        nested2: {
          'super-nested-component.hbs': '{{!-- nested1/nested2/super-nested-component.hbs --}}',
          'super-nested-component.js': '// nested1/nested2/super-nested-component.js'
        }
      }
    },
    templates: {
      'application.hbs': '{{outlet}}',
    }
  },
};