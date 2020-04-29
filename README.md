# ember-component-template-colocation

This codemod will co-locate component JS and HBS as described in the [Component Templates Co-location RFC](https://emberjs.github.io/rfcs/0481-component-templates-co-location.html).

### Examples

 * [Travis CI](https://github.com/GavinJoyce/travis-web/pull/1)
 * [Ghost Admin](https://github.com/GavinJoyce/Ghost-Admin/pull/1)

### Usage

To run the migrator on your app:

```sh
cd your/project/path
npx github:ember-codemods/ember-component-template-colocation-migrator
```

By default, the migrator changes the **classic** component structure to the **flat** component structure.

```
your-project-name
├── app
│   └── components
│       ├── foo-bar
│       │   ├── baz.hbs
│       │   └── baz.js
│       ├── foo-bar.hbs
│       └── foo-bar.js
│   ...
```

If you want to change from **classic** to **nested**, you can add the `-ns` flag:

```sh
cd your/project/path
npx github:ember-codemods/ember-component-template-colocation-migrator -ns
```

The nested component structure looks like:

```
your-project-name
├── app
│   └── components
│       └── foo-bar
│           ├── baz
│           │   ├── index.hbs
│           │   └── index.js
│           ├── index.hbs
│           └── index.js
│   ...
```


### Running Tests

 * `npm run test`