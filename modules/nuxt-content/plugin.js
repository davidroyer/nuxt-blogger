export default (context, inject) => {

  const contentApi = {
    get: (path) => {
      return require(`@/static/api/${path}.json`)
    }
  }
  context.$content = contentApi
  inject('content', contentApi)
}

// Need to get options
// Need to fix path not existing for statc/api when saving main module file (index.js).
