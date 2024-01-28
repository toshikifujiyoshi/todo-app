<script setup lang="ts">
import { initializeApp } from 'firebase/app'
import { getFirestore, getDocs, collection, doc, deleteDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDghhPGaW0nCEm6Hjq2UrX5fBRK6Ikf9_U',
  authDomain: 'todo-app-dc029.firebaseapp.com',
  projectId: 'todo-app-dc029',
  storageBucket: 'todo-app-dc029.appspot.com',
  messagingSenderId: '503092853490',
  appId: '1:503092853490:web:9293af402fc98b0d2bee6b',
  measurementId: 'G-QW7NGBKF7K'
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

definePageMeta({
  layout: 'is-sidebar'
})

type DocumentData = {
  field: {
    todoTitle: string
  }
  id: string
}

const todos = ref<DocumentData[]>([])

// データの取得
const querySnapshot = await getDocs(collection(db, 'todos'))
querySnapshot.forEach(doc => todos.value.push({ field: { todoTitle: doc.data().todoTitle }, id: doc.id }))

// todo を削除する関数
const deleteTodo = async (todoId: string) => {
  try {
    // todoId に対応するドキュメントを削除
    await deleteDoc(doc(db, 'todos', todoId))

    // 削除後、todos 配列からも削除
    todos.value = todos.value.filter(todo => todo.id !== todoId)
  } catch (error) {
    console.error('Error deleting todo:', error)
  }
}
</script>

<template>
  <div class="p-20 h-[100%] w-[100%] bg-slate-400">
    <div class="bg-white rounded-md p-4 text-lg">
      <h2 class="font-bold mb-2">
        todo一覧
      </h2>
      <div v-for="{field, id} in todos" :key="id" class="flex justify-between p-2 border-t">
        <p class="text-black">{{ field.todoTitle }}</p>
        <UButton label="削除する" color="rose" variant="solid" @click="() => deleteTodo(id)" />
      </div>
    </div>
  </div>
</template>
