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
  asyncData ({ $content, params }) {
    const post = $content.get(`blog/${params.id}`)
    return { post }
  }
}
</script>

<style src='~/node_modules/highlight.js/styles/atom-one-dark-reasonable.css'></style>
