<template>
<div class="project">
    <h1>Projects</h1>
    <div>
        <div v-for="project in project" :key="project.id">
            <nuxt-link :to="`/project/${project.id}`">
                <h2 v-text="project.title"></h2>
            </nuxt-link>
        </div>
    </div>
</div>
</template>

<script>

export default {
    async asyncData({ $axios }) {
        // $get('api/project')
    // const project = await $axios.$get('http://localhost:3000/api/project.json')
    const project = require('@/static/api/projects.json')
    return { project }
    }    
}
</script>

<style>

</style>
