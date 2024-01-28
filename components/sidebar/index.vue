<script setup lang="ts">
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc } from 'firebase/firestore'

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
const isOpen = ref(false)
const todoTitle = ref<string>('')
const count = ref(0)

/**
 * Emits
 */
interface Emits {
  // 関数名, 引数の型, 返り値の型
  (e: 'addTodo', v: number): void;
}

const emits = defineEmits<Emits>()

const addTodo = async () => {
  await addDoc(collection(db, 'todos'), {
    todoTitle: todoTitle.value
  })
  // モーダルを閉じる
  isOpen.value = false
  // ユーザーが入力した値をリセット
  todoTitle.value = ''
  count.value++
  emits('addTodo', count.value)
}
</script>
<template>
  <div class="p-20 w-[100%] height-[100%] bg-slate-200">
    <div class="bg-white p-6">
      <div>
        <p>タスクを作成</p>
        <UInput v-model="todoTitle" placeholder="タスク名を入力" />
      </div>
      <div class="mt-8">
        <UButton label="タスクを作成する" block @click="isOpen = true" />
        <UModal v-model="isOpen">
          <div class="p-4">
            <div>
              <UInput v-model="todoTitle" placeholder="タスク名を入力" />
              <UButton label="タスクを作成する" block @click="addTodo" />
            </div>
          </div>
        </UModal>
      </div>
    </div>
  </div>
</template>
