const template = require('babel-template')

const TEMPLATE = `
(function () {
  var status = {
    error: null,
    retry: null
  }

  return {
    component: new Promise(function (resolve) {
      void function load () {
        status.error = null
        status.retry = null
        __import__(__modulePath__).then(resolve, function (err) {
          status.error = err
          status.retry = load
        })
      }()
    }),

    loading: {
      data: function () {
        return status
      },

      render (h) {
        return this.error
          ? __errorExpression__
          : __loadingExpression__
      }
    },

    delay: 0
  }
})
`

const LOADING_TEMPLATE = `h(__loadingNode__)`

const ERROR_TEMPLATE = `h(__errorNode__, { attrs: { error: this.error, retry: this.retry } })`

module.exports = function (babel) {
  const { types: t } = babel;

  return {
    visitor: {
      CallExpression(path) {
        const node = path.node
        if (node.callee.name !== 'import_component') return

        const modulePath = node.arguments[0].value
        const configs = node.arguments[1].properties

        const loadingNode = configs.find(i => i.key.name === 'loading')
        const errorNode = configs.find(i => i.key.name === 'error')

        const loadingExpression = loadingNode
          ? template(LOADING_TEMPLATE)({ __loadingNode__: loadingNode.value })
          : t.identifier('undefined')

        const errorExpression = errorNode
          ? template(ERROR_TEMPLATE)({ __errorNode__: errorNode.value })
          : t.identifier('undefined')

        const foo = template(TEMPLATE)({
          __import__: t.identifier('import'),
          __modulePath__: t.stringLiteral(modulePath),
          __loadingExpression__: loadingExpression,
          __errorExpression__: errorExpression
        })

        path.replaceExpressionWithStatements([foo])
      }
    }
  }
}
