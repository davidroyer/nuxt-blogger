<template>
  <div class="blog">
    <h1>Blog Posts</h1>
    <div>
      <div
        v-for="post in posts"
        :key="post.id"
      >
        <nuxt-link :to="`/blog/${post.id}`">
          <h2 v-text="post.title"></h2>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  asyncData ({$content}) {
    const posts = $content.get('blog')
    return { posts }
  }
}
</script>

<style>
</style>
