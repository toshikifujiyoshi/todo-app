<script setup lang="ts">
const sidebarKey = ref<number>(0);
const handleAddTodo = (count: number) => {
  sidebarKey.value = count;
};
</script>
<template>
  <div class="grid min-h-screen grid-rows-[auto_1fr_auto]">
    <Header />
    <div class="flex w-[85%] h-[100%] m-auto">
      <Sidebar class="w-[40%]" @addTodo="handleAddTodo" />
      <main :key="sidebarKey" class="w-[60%] ml-10">
        <slot />
      </main>
    </div>
    <Footer />
  </div>
</template>
