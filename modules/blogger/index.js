import path from 'path'


export default async function apiModule (moduleOptions) {
    const bloggerApi = require('./api')

    if (this.options.dev) {
      // this.addServerMiddleware(bloggerApi);
    }
    
    this.nuxt.hook('modules:done', moduleContainer => {
        console.log('This will be called when all modules finished loading')
      })
    
      this.nuxt.hook('render:setupMiddleware', renderer => {
        console.log('Called after the renderer was created')
      })
    
      this.nuxt.hook('build:compile', async ({name, compiler }) => {
        console.log('Called before the compiler (default: webpack) starts')
      })
    
      this.nuxt.hook('generate:before', async generator => {
        console.log('This will be called before Nuxt generates your pages')
      })
}
