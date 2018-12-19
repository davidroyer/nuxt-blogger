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
    outputDir: '_DB/api',
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

  const options = Object.assign(defaultOptions, this.options.content, moduleOptions);

  console.log('index.js options: ', options)
  // markdown plugin
  for (let plugin of options.markdown) {
    markdown.use(plugin);
  }

  const contentDirectory = path.join(process.cwd(), options.inputDir);
  
  this.nuxt.hook('build:before', async () => {
    const outputDirPath = path.join(process.cwd(), options.outputDir);
    const collections = await globMd2data(contentDirectory);
    const allTags = tagRoutes(collections.blog)

    // fsCleanUp(outputDirPath)
    fsMakeDirectory(outputDirPath)


    for (let modelName in collections) {
      const mds = collections[modelName];
      const outputDirModelPath = path.join(outputDirPath, modelName);
      const inputImageDirPath = path.join(contentDirectory, modelName, 'images');
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
    const api = await globMd2data(contentDirectory);

    for (let modelName in api) {
      for (let md of api[modelName]) {
        routes.push({ route: `/${modelName}/${md.id}` });
      }
    }
  });

  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    options
  })
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

const tagRoutes = posts => {
  let tagsArray = [];
  for (var i = 0; i < posts.length; i++) {
    for (var n = 0; n < posts[i].tags.length; n++) {
      tagsArray.push(posts[i].tags[n]);
    }
  }
  return uniqueArray(tagsArray);
};

const uniqueArray = originalArray => [...new Set(originalArray)];
