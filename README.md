# babel-plugin-async-vue-component
Better way to import async vue components in webpack

## quick start
Add babel plugin in `.babelrc`:
```json
{
  "plugins": ["babel-plugin-async-vue-component"]
}
```

```js
import LoadingComp from '@/components/Loading.vue'
import ErrorComp from '@/components/Error.vue'

export default {
  components: {
    // use `import_component` instead of `import`
    Foo: import_component('@/components/Foo.vue', {
      // component will be render during loading
      loading: LoadingComp,
      // component will be render when loading failed
      error: ErrorComp
    })
  }
}
```

```html
<!-- Error.vue -->
<template>
  <div>
    <h2>Load async component error</h2>
    <p>message: {{ error.message }}</p>
    <p>stack: {{ error.stack }}</p>
    <button @click="retry">Retry</button>
  </div>
<template>

<script>
export default {
  props: ['error', 'retry']
}
</script>
```
