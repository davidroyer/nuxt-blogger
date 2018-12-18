export default (context, inject) => {

  const contentApi = {
    get: (path) => {
      return require(`@/static/api/${path}.json`)
    }
  }
  context.$content = contentApi
  inject('content', contentApi)
}
