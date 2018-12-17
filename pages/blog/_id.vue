<template>
  <div class="blog">
    <h1 v-text="post.title"></h1>
    <article v-html="post.html"></article>
    <br>
    <hr><br>
    <pre>{{post}}</pre>
  </div>
</template>

<script>
export default {
  async asyncData ({ $axios, params }) {
    const post = require(`@/static/api/blog/${params.id}.json`)

    return { post }
  }
}
</script>
