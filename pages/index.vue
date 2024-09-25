<script setup lang="ts">
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  getDocs,
  collection,
  doc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { sub, format } from 'date-fns';

const selected = ref({
  start: sub(new Date(), { days: undefined }),
  end: new Date(),
});

const firebaseConfig = {
  apiKey: 'AIzaSyDghhPGaW0nCEm6Hjq2UrX5fBRK6Ikf9_U',
  authDomain: 'todo-app-dc029.firebaseapp.com',
  projectId: 'todo-app-dc029',
  storageBucket: 'todo-app-dc029.appspot.com',
  messagingSenderId: '503092853490',
  appId: '1:503092853490:web:9293af402fc98b0d2bee6b',
  measurementId: 'G-QW7NGBKF7K',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

definePageMeta({
  layout: 'is-sidebar',
});

type DocumentData = {
  field: {
    todoTitle: string;
    todoDetail: string;
    startDate: any;
    targetDate: any;
    isCompleted: boolean;
  };
  id: string;
};

const todos = ref<DocumentData[]>([]);

// データの取得
const querySnapshot = await getDocs(collection(db, 'todos'));
querySnapshot.forEach((doc) =>
  todos.value.push({
    field: {
      todoTitle: doc.data().todoTitle,
      todoDetail: doc.data().todoDetail,
      startDate: doc.data().startDate ? doc.data().startDate.toDate() : null,
      targetDate: doc.data().targetDate ? doc.data().targetDate.toDate() : null,
      isCompleted: doc.data().isCompleted,
    },
    id: doc.id,
  })
);

const isOpen = ref(false);
// 編集モーダルを開く関数
const openModal = (
  todoTitle: string,
  todoDetail: string,
  startDate: any,
  targetDate: any,
  isCompleted: boolean,
  id: string
) => {
  isOpen.value = true;
  editedTodo.value = {
    field: {
      todoTitle,
      todoDetail,
      startDate,
      targetDate,
      isCompleted,
    },
    id,
  };
  selected.value.start = new Date(startDate);
  selected.value.end = new Date(targetDate);
};

// todo を削除する関数
const deleteTodo = async (todoId: string) => {
  try {
    // todoId に対応するドキュメントを削除
    await deleteDoc(doc(db, 'todos', todoId));

    // 削除後、todos 配列からも削除
    todos.value = todos.value.filter((todo) => todo.id !== todoId);
  } catch (error) {
    console.error('Error deleting todo:', error);
  }
  // モーダルを閉じる
  isOpen.value = false;
};

const editedTodo = ref<DocumentData>({
  field: {
    todoTitle: '',
    todoDetail: '',
    startDate: null,
    targetDate: null,
    isCompleted: false,
  },
  id: '',
});
// 編集を保存する関数
const saveEdit = async (todoId: string) => {
  try {
    await updateDoc(doc(db, 'todos', todoId), {
      todoTitle: editedTodo.value.field.todoTitle,
      todoDetail: editedTodo.value.field.todoDetail,
      startDate: selected.value.start,
      targetDate: selected.value.end,
      isCompleted: editedTodo.value.field.isCompleted,
    }).then(async () => {
      todos.value.length = 0;
      const querySnapshot = await getDocs(collection(db, 'todos'));
      querySnapshot.forEach((doc) =>
        todos.value.push({
          field: {
            todoTitle: doc.data().todoTitle,
            todoDetail: doc.data().todoDetail,
            startDate: doc.data().startDate
              ? doc.data().startDate.toDate()
              : null,
            targetDate: doc.data().targetDate
              ? doc.data().targetDate.toDate()
              : null,
            isCompleted: doc.data().isCompleted,
          },
          id: doc.id,
        })
      );
      // モーダルを閉じる
      isOpen.value = false;
    });
  } catch (error) {
    console.error('Error updating todo:', error);
  }
};

const page = ref(1);
const pageCount = ref(10);
const displayTodos = computed(() =>
  todos.value.slice(
    pageCount.value * (page.value - 1),
    pageCount.value * page.value
  )
);
</script>

<template>
  <div class="px-10 py-20 h-[100%] w-[100%] bg-slate-400">
    <div class="bg-white rounded-md p-4 text-lg">
      <h2 class="font-bold mb-2">タスク一覧</h2>
      <div>
        <div v-if="todos.length !== 0">
          <div
            v-for="{ field, id } in displayTodos"
            :key="id"
            class="flex justify-between p-2 border-t"
          >
            <div class="flex">
              <div class="w-[60px] mr-4 text-center">
                <UBadge
                  variant="subtle"
                  color="emerald"
                  :label="field.isCompleted ? '完了' : '進行中'"
                  :class="
                    !field.isCompleted
                      ? 'text-orange-500 bg-orange-50 ring-orange-500'
                      : ''
                  "
                />
              </div>
              <p class="text-black">{{ field.todoTitle }}</p>
            </div>
            <UButton
              label="編集する"
              class="ml-2"
              @click="
                openModal(
                  field.todoTitle,
                  field.todoDetail,
                  field.startDate,
                  field.targetDate,
                  field.isCompleted,
                  id
                )
              "
            />
          </div>
          <UPagination v-model="page" :page-count="10" :total="todos.length" />

          <UModal v-model="isOpen">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="absolute top-0 right-0"
              @click="isOpen = false"
            />
            <div class="p-4">
              <div>
                <p>タスク名</p>
                <UInput
                  v-model="editedTodo.field.todoTitle"
                  placeholder="タスク名を編集する"
                  class="mt-2"
                />
                <p class="mt-6">タスクの詳細</p>
                <UTextarea
                  v-model="editedTodo.field.todoDetail"
                  placeholder="タスクの詳細を編集する"
                  class="mt-2"
                />

                <div class="mt-6">
                  <p>タスクの期限</p>
                  <p class="mt-2">
                    {{ format(new Date(selected.start), 'M月d日 (E)') }}
                    <span class="ml-4">〜</span>
                    <span class="ml-4">{{
                      format(new Date(selected.end), 'M月d日 (E)')
                    }}</span>
                  </p>
                  <UPopover
                    :popper="{ placement: 'bottom-start' }"
                    class="mt-2"
                  >
                    <UButton
                      icon="i-heroicons-calendar-days-20-solid"
                      variant="soft"
                    >
                      {{ format(selected.start, 'd MMM, yyy') }} ~
                      {{ format(selected.end, 'd MMM, yyy') }}
                    </UButton>

                    <template #panel="{ close }">
                      <div
                        class="flex items-center sm:divide-x divide-gray-200 dark:divide-gray-800"
                      >
                        <DatePicker v-model="selected" @close="close" />
                      </div>
                    </template>
                  </UPopover>
                </div>
                <p class="mt-6">タスクのステータス</p>
                <div class="mt-2">
                  <UToggle
                    v-model="editedTodo.field.isCompleted"
                    size="xl"
                    on-icon="i-heroicons-check-20-solid"
                    off-icon="i-heroicons-x-mark-20-solid"
                    class="mr-4"
                  />
                  <p v-if="editedTodo.field.isCompleted">完了</p>
                  <p v-else>未完了</p>
                </div>
                <div class="mt-6">
                  <UButton
                    label="編集を保存する"
                    block
                    @click="saveEdit(editedTodo.id)"
                  />
                  <UButton
                    label="削除する"
                    block
                    color="rose"
                    class="mt-4"
                    @click="deleteTodo(editedTodo.id)"
                  />
                </div>
              </div>
            </div>
          </UModal>
        </div>
        <div v-else class="border-t text-center py-8">
          タスクがありません。タスクを作成してください。
        </div>
      </div>
    </div>
  </div>
</template>
