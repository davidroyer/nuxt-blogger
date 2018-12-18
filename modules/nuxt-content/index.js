import fs from 'fs-extra'
const path = require('path');
const moment = require('moment');
const splitArray = require('split-array');
const globMd2data = require('glob-md2data');
const markdown = require('markdown-it')({ html: true });
const markdownImg = require('markdown-it-img');
const markdownHighlight = require('markdown-it-highlightjs')

module.exports = function (moduleOptions) {
  const defaultOptions = {
    inputDir: 'content',
    outputDir: 'static/api',
    lists: [
      { name: 'list', sort: (a, b) => moment(a.date).unix() < moment(b.date).unix() }
    ],
    markdown: [
      markdownHighlight,
      markdownImg((attr, value, env) => {
        if (attr === 'src') {
          return value.replace('./', `/api/${env.modelName}/`);
        }
      })
    ]
  };

  const options = Object.assign(defaultOptions, moduleOptions);

  // markdown plugin
  for (let plugin of options.markdown) {
    markdown.use(plugin);
  }

  const apiDir = path.join(process.cwd(), options.inputDir);
  this.addPlugin(path.resolve(__dirname, 'plugin.js'))

  // convert md to json
  this.nuxt.hook('build:before', async () => {
    const outputDirPath = path.join(process.cwd(), options.outputDir);
    const api = await globMd2data(apiDir);

    fsCleanUp(outputDirPath)
    fsMakeDirectory(outputDirPath)

    for (let modelName in api) {
      const mds = api[modelName];
      const outputDirModelPath = path.join(outputDirPath, modelName);
      const inputImageDirPath = path.join(apiDir, modelName, 'images');
      const outputImageDirPath = path.join(outputDirModelPath, 'images');
      const imageDirExists = await fs.pathExists(inputImageDirPath)      
      
      fsMakeDirectory(outputDirModelPath)
      if (imageDirExists) fsCopy(inputImageDirPath, outputImageDirPath);

      // write single model
      for (let md of mds) {
        md.html = markdown.render(md.body, { modelName });
        fsOutputJson(`${path.join(outputDirModelPath, md.id)}.json`, md)
      }

      // write list api
      for (let sortData of options.lists) {
        const sorted = mds.sort(sortData.sort);

        if (sortData.limit) {
          const limted = splitArray(sorted, sortData.limit);
          for (let i = 0; i < limted.length; i++) {
            const basename = `${sortData.name}-${i}`;
            fsOutputJson(`${path.join(outputDirModelPath)}.json`, limted[i]);
          }
        } else {
          fsOutputJson(`${path.join(outputDirModelPath)}.json`, sorted);
        }
      }
    }
  });

  // add model route
  this.nuxt.hook('generate:extendRoutes', async (routes) => {
    const api = await globMd2data(apiDir);

    for (let modelName in api) {
      for (let md of api[modelName]) {
        routes.push({ route: `/${modelName}/${md.id}` });
      }
    }
  }); 
}

// Async/Await:
async function fsCopy(input, output) {
  try {
    await fs.copy(input, output)
    console.log('success!')
  } catch (err) {
    console.error(err)
  }
}

// With async/await:
async function fsCleanUp(input) {
  try {
    await fs.remove(input)
    console.log('fsCleanUp success!')
  } catch (err) {
    console.error(err)
  }
}

async function fsMakeDirectory(directory) {
  try {
    await fs.ensureDir(directory)
    console.log('fsMakeDirectory success!')
  } catch (err) {
    console.error(err)
  }
}

async function fsOutputJson(path, data) {
  try {
    await fs.outputJson(path, data)
    console.log('fsOutputJson success!')
  } catch (err) {
    console.error(err)
  }
}