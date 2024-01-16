<script setup lang="ts">
import { initializeApp } from 'firebase/app'
import { getFirestore, getDocs, collection } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDghhPGaW0nCEm6Hjq2UrX5fBRK6Ikf9_U',
  authDomain: 'todo-app-dc029.firebaseapp.com',
  projectId: 'todo-app-dc029',
  storageBucket: 'todo-app-dc029.appspot.com',
  messagingSenderId: '503092853490',
  appId: '1:503092853490:web:9293af402fc98b0d2bee6b',
  measurementId: 'G-QW7NGBKF7K'
}
// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

definePageMeta({
  // レイアウト選択(ケバブケース)
  layout: 'is-sidebar'
})

const isOpen = ref(false)

const todos = ref([]) // todoListをrefで宣言

const querySnapshot = await getDocs(collection(db, 'todos'))
querySnapshot.forEach(doc => todos.value.push({ field: doc.data(), id: doc.id }))
</script>
<template>
  <div class="p-20 h-[100%] w-[100%] bg-slate-400">
    <div class="bg-white rounded-md p-4 text-lg">
      <h2 class="font-bold mb-2">
        todo一覧
      </h2>
      <div v-for="todo in todos" :key="todo" class="flex justify-between p-2 border-t">
        <p>{{ todo.field.todoTitle }}</p>
        <UButton label="削除する" color="rose" variant="solid" @click="delateTodo" />
      </div>
    </div>
  </div>
</template>
