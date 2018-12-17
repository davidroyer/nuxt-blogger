<template>
  <div class="projects">
    <h1 v-text="project.title"></h1>
    <article v-html="project.html"></article>
    <br>
    <hr><br>
    <pre>{{project}}</pre>
  </div>
</template>

<script>
export default {
  async asyncData ({ $axios, params }) {
    const project = require(`@/static/api/projects/${params.id}.json`)
    return { project }
  }
}
</script>
