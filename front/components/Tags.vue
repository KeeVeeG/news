<script setup>
const {value} = defineProps(['value'])
</script>

<template>
  <div>
    <div v-for="item of value">{{ item }}</div>
  </div>
</template>