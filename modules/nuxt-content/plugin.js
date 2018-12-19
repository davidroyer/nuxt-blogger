import path from 'path'

export default (context, inject) => {
  const opts = Object.assign({}, <%= serialize(options) %>  )

  const contentApi = {
    get: (path) => {
      return require(`@/${opts.outputDir}/${path}.json`)
    }
  }
  
  context.$content = contentApi
  inject('content', contentApi)
}

// Need to get options
// Need to fix path not existing for statc/api when saving main module file (index.js).
