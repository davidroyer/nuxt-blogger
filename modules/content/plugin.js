export default (context, inject) => {

  const contentApi = {
    get: (path) => {
      return require(`@/static/api/${path}.json`)
    }
  }
  context.$content = contentApi
  inject('content', contentApi)
}
// $content.get('blog')
// $content.get(`blog/${params.id}`)

// export default ({ app }, inject) => {
//   inject('myInjectedFunction', (string) => console.log('That was easy!', string))
// }