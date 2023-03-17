<script setup>
const {baseURL} = useRuntimeConfig();

const {value} = defineProps(['value'])
const {tag, gpt, text, id} = value
</script>

<template>

  <p v-if="tag === 'p'">
    {{ gpt }}
  </p>

  <h2 v-else-if="tag === 'h2'">
    {{ text }}
  </h2>

  <img v-else-if="tag === 'img'" :src="baseURL  + 'img/' + id">

  <iframe v-else-if="tag === 'video'" :src="'http://www.youtube.com/embed/' + id"/>

  <div v-else-if="tag === 'code'">
    {{ text }}
  </div>

</template>