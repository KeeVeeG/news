<script setup>
const route = useRoute()
const {baseURL} = useRuntimeConfig();
const {data} = await useFetch(`post/${route.params.postId}`, {baseURL})
const {title, color, img, tags, els} = data.value

</script>

<template>
  <div>
    <h1>
      {{title}}
    </h1>
    <div>
      <El v-for="item of els" :value="item"/>
    </div>
    <Tags :value="tags"/>
  </div>
</template>