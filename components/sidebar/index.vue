<script setup lang="ts">
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { sub, format } from 'date-fns';

const selected = ref({
  start: sub(new Date(), { days: -14 }),
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
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const isOpen = ref(false);
const todoTitle = ref<string>('');
const todoDetail = ref<string>('');
const count = ref(0);

/**
 * Emits
 */
interface Emits {
  // 関数名, 引数の型, 返り値の型
  (e: 'addTodo', v: number): void;
}

const emits = defineEmits<Emits>();

const addTodo = async () => {
  if (todoTitle.value === '') {
    return;
  }
  await addDoc(collection(db, 'todos'), {
    todoTitle: todoTitle.value,
    todoDetail: todoDetail.value,
    startDate: selected.value.start,
    targetDate: selected.value.end,
    isCompleted: false,
  });
  // モーダルを閉じる
  isOpen.value = false;
  // ユーザーが入力した値をリセット
  todoTitle.value = '';
  todoDetail.value = '';
  count.value++;
  emits('addTodo', count.value);
};
</script>
<template>
  <div class="px-10 py-20 w-[100%] height-[100%] bg-slate-200">
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
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark-20-solid"
                class="absolute top-0 right-0"
                @click="isOpen = false"
              />
              <p>タスク名</p>
              <UInput
                v-model="todoTitle"
                placeholder="タスク名を入力"
                class="mt-2"
              />
              <p class="mt-6">タスクの詳細</p>
              <UTextarea
                v-model="todoDetail"
                placeholder="タスクの詳細を入力"
                class="mt-2"
              />
              <div class="mt-4">
                <p>タスクの期限</p>
                <UPopover :popper="{ placement: 'bottom-start' }" class="mt-2">
                  <UButton
                    icon="i-heroicons-calendar-days-20-solid"
                    variant="soft"
                  >
                    {{ format(selected.start, 'd MMM, yyy') }} -
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
              <UButton
                label="タスクを作成する"
                block
                class="mt-6"
                @click="addTodo"
              />
            </div>
          </div>
        </UModal>
      </div>
    </div>
  </div>
</template>
