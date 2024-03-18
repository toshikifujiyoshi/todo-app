<script setup lang="ts">
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  getDocs,
  collection,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDghhPGaW0nCEm6Hjq2UrX5fBRK6Ikf9_U",
  authDomain: "todo-app-dc029.firebaseapp.com",
  projectId: "todo-app-dc029",
  storageBucket: "todo-app-dc029.appspot.com",
  messagingSenderId: "503092853490",
  appId: "1:503092853490:web:9293af402fc98b0d2bee6b",
  measurementId: "G-QW7NGBKF7K",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

definePageMeta({
  layout: "is-sidebar",
});

type DocumentData = {
  field: {
    todoTitle: string;
  };
  id: string;
};
const todos = ref<DocumentData[]>([]);
const isOpen = ref(false);
const count = ref(0);
const editedTodo = ref<{ field: { todoTitle: string }; id: string }>({
  field: { todoTitle: "" },
  id: "",
});

// データの取得
const querySnapshot = await getDocs(collection(db, "todos"));
querySnapshot.forEach((doc) =>
  todos.value.push({ field: { todoTitle: doc.data().todoTitle }, id: doc.id })
);

// todo を削除する関数
const deleteTodo = async (todoId: string) => {
  try {
    // todoId に対応するドキュメントを削除
    await deleteDoc(doc(db, "todos", todoId));

    // 削除後、todos 配列からも削除
    todos.value = todos.value.filter((todo) => todo.id !== todoId);
  } catch (error) {
    console.error("Error deleting todo:", error);
  }
};

// 編集モーダルを開く関数
const openModal = (todoTitle: string, id: string) => {
  isOpen.value = true;
  editedTodo.value = { field: { todoTitle: todoTitle }, id: id };
  console.log(todos);
};

interface Emits {
  // 関数名, 引数の型, 返り値の型
  (e: "saveEdit", v: number): void;
}
const emits = defineEmits<Emits>();

// 編集を保存する関数
const saveEdit = async (todoId: string) => {
  try {
    await updateDoc(doc(db, "todos", todoId), {
      todoTitle: editedTodo.value.field.todoTitle,
    });
    // モーダルを閉じる
    isOpen.value = false;
    // ページを更新
    count.value++;
    emits("saveEdit", count.value);
  } catch (error) {
    console.error("Error updating todo:", error);
  }
};
</script>

<template>
  <div class="px-10 py-20 h-[100%] w-[100%] bg-slate-400">
    <div class="bg-white rounded-md p-4 text-lg">
      <h2 class="font-bold mb-2">todo一覧</h2>
      <div
        v-for="{ field, id } in todos"
        :key="id"
        class="flex justify-between p-2 border-t"
      >
        <p class="text-black">{{ field.todoTitle }}</p>
        <div>
          <UButton
            label="削除する"
            color="rose"
            variant="solid"
            @click="() => deleteTodo(id)"
          />
          <UButton
            label="編集する"
            @click="openModal(field.todoTitle, id)"
            class="ml-2"
          />
        </div>
      </div>
      <UModal v-model="isOpen">
        <div class="p-4">
          <input
            v-model="editedTodo.field.todoTitle"
            class="border border-gray-300 p-1"
          />
          <UButton
            label="編集を保存する"
            block
            @click="saveEdit(editedTodo.id)"
          />
        </div>
      </UModal>
    </div>
  </div>
</template>
