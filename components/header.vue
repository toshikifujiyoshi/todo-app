<script setup lang="ts">
const links = [
  {
    label: 'Profile',
    avatar: {
      src: ''
    }
  },
  {
    label: 'Installation',
    icon: 'i-heroicons-home',
    to: ''
  },
  {
    label: 'Vertical Navigation',
    icon: 'i-heroicons-chart-bar',
    to: ''
  },
  {
    label: 'Command Palette',
    icon: 'i-heroicons-command-line',
    to: ''
  }
]
</script>

<template>
  <div class="bg-slate-800 text-white flex justify-between items-center p-6">
    <NuxtLink to="/">
      <img class="w-12" src="../public/todo_icon.png">
    </NuxtLink>
    <h1 class="text-2xl justify-center">
      ToDoApp
    </h1>
    <div>
      <UPopover>
        <UButton
          color="white"
          size="xl"
          label="MENU"
          trailing-icon="i-heroicons-chevron-down-20-solid"
        />

        <template #panel>
          <div class="p-4">
            <UVerticalNavigation :links="links" />
          </div>
        </template>
      </UPopover>
    </div>
  </div>
</template>
