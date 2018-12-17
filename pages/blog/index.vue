<template>
<div class="blog">
    <h1>Blog Posts</h1>
    <div>
        <div v-for="post in posts" :key="post.id">
            <nuxt-link :to="`/blog/${post.id}`">
                <h2 v-text="post.title"></h2>
            </nuxt-link>
        </div>
    </div>
</div>
</template>

<script>

export default {
    async asyncData({ $axios }) {
        // $get('api/posts')
    // const posts = await $axios.$get('http://localhost:3000/api/blog.json')
    const posts = require('@/static/api/blog.json')
    return { posts }
    }    
}
</script>

<style>

</style>
