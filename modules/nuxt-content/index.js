const path = require('path');
const util = require('util');
const del = require('del');
const mkdirp = util.promisify(require('mkdirp'));
const jsonWrite = util.promisify(require('jsonfile').writeFile);
const moment = require('moment');
const splitArray = require('split-array');
const copyDir = require('copy-dir');
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

    await del(outputDirPath)
    await mkdirp(outputDirPath);

    const api = await globMd2data(apiDir);
    for (let modelName in api) {
      const outputDirModelPath = path.join(outputDirPath, modelName);
      await mkdirp(outputDirModelPath);

      // copy images to static dir
      const inputImageDirPath = path.join(apiDir, modelName, 'images');
      const outputImageDirPath = path.join(outputDirModelPath, 'images');
      try {
        copyDir.sync(inputImageDirPath, outputImageDirPath);

      // eslint-disable-next-line
      } catch (error) {}

      const mds = api[modelName];

      // write single model
      for (let md of mds) {
        md.html = markdown.render(md.body, { modelName });
        await jsonWrite(`${path.join(outputDirModelPath, md.id)}.json`, md);
      }

      // write list api
      for (let sortData of options.lists) {
        const sorted = mds.sort(sortData.sort);

        if (sortData.limit) {
          const limted = splitArray(sorted, sortData.limit);
          for (let i = 0; i < limted.length; i++) {
            const basename = `${sortData.name}-${i}`;
            await jsonWrite(`${path.join(outputDirModelPath)}.json`, limted[i]);
          }
        } else {
          await jsonWrite(`${path.join(outputDirModelPath)}.json`, sorted);
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