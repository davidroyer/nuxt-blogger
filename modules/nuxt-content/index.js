import fs from 'fs-extra'
import chokidar from 'chokidar'
const path = require('path');
const moment = require('moment');
const splitArray = require('split-array');
const globMd2data = require('glob-md2data');
const markdown = require('markdown-it')({
  html: true
});
const markdownImg = require('markdown-it-img');
const markdownHighlight = require('markdown-it-highlightjs')

module.exports = function (moduleOptions) {
  const defaultOptions = {
    sourceDir: 'content',
    outputDir: 'static/api',
    lists: [{
      name: 'list',
      sort: (a, b) => moment(a.date).unix() < moment(b.date).unix()
    }],
    markdown: [
      markdownHighlight,
      markdownImg((attr, value, env) => {
        if (attr === 'src') {
          return value.replace('./', `/api/${env.collectionName}/`);
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

  const contentDirectory = path.join(process.cwd(), options.sourceDir);
  const outputDirPath = path.join(process.cwd(), options.outputDir);



// Initialize watcher.
var watcher = chokidar.watch(`${contentDirectory}/**/*.md`, {
  // awaitWriteFinish: {
  //   stabilityThreshold: 2000,
  //   pollInterval: 100
  // }
})


  watcher.on('all', async (event, filePath) => {

    console.log('event: ', event)
    console.log('filePath: ', filePath)
    if (event === 'add' || event === 'change') {
      const collectionsMD = await globMd2data(contentDirectory);
      console.log('collectionsMD from WATCH: ', collectionsMD)
      // generateCollectionsJsonFiles(collectionsMD)

      const collectionName = 'projects'
      const collection = collectionsMD[collectionName];
      const collectionItem = collection[0]

      collectionItem.html = markdown.render(collectionItem.body, {
        collectionName
      });
      path.join(outputDirPath, collectionName, collectionItem.id)
      fsOutputJson(`${path.join(outputDirPath, collectionName, collectionItem.id)}.json`, collectionItem)
      generateCollectionsJsonFiles(collectionsMD)

    }
  })

  // this.nuxt.hook('build:before', async () => {
  this.nuxt.hook('ready', async () => {
    const outputDirPath = path.join(process.cwd(), options.outputDir);

    // fsCleanUp(outputDirPath)
    fsMakeDirectory(outputDirPath)

    const collectionsMD = await globMd2data(contentDirectory);
    const allTags = tagRoutes(collectionsMD.blog)

    generateCollectionsJsonFiles(collectionsMD)
  });

  async function generateCollectionsJsonFiles(collectionsMD) {
    for (let collectionName in collectionsMD) {
      const collection = collectionsMD[collectionName];
      const outputDirModelPath = path.join(outputDirPath, collectionName);
      const inputImageDirPath = path.join(contentDirectory, collectionName, 'images');
      const outputImageDirPath = path.join(outputDirModelPath, 'images');
      const imageDirExists = await fs.pathExists(inputImageDirPath)

      fsMakeDirectory(outputDirModelPath)
      if (imageDirExists) fsCopy(inputImageDirPath, outputImageDirPath);

      // write single model
      for (let collectionItem of collection) {
        collectionItem.html = markdown.render(collectionItem.body, {
          collectionName
        });
        fsOutputJson(`${path.join(outputDirModelPath, collectionItem.id)}.json`, collectionItem)
      }

      // write list api
      for (let sortData of options.lists) {
        const sorted = collection.sort(sortData.sort);

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
  }



  // add model route
  this.nuxt.hook('generate:extendRoutes', async (routes) => {
    const collectionsMD = await globMd2data(contentDirectory);

    for (let collectionName in collectionsMD) {
      for (let contentItem of collectionsMD[collectionName]) {
        routes.push({
          route: `/${collectionName}/${contentItem.id}`
        });
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
