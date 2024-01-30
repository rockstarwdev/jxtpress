<template>
  <div class="jxt app">

    <NuxtLayout :name="layout">
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script setup>
  //uk(self): i disabled this in order to enable custom layouts to work
  // You might choose this based on an API call or logged-in status
  const layout = ref("default")

  if ( process.client){ 
    window.$fetch = $fetch
  }
</script>
