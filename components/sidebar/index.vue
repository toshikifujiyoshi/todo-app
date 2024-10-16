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
const addTodoModalIsOpen = ref(false);
const isError = ref(false);
const todoTitle = ref<string>('');
const todoDetail = ref<string>('');
const count = ref(0);
const toast = useToast();

interface Emits {
  (e: 'addTodo', v: number): void;
}

const emits = defineEmits<Emits>();

const addTodo = async () => {
  if (todoTitle.value === '') {
    isError.value = true;
    return;
  }
  try {
    await addDoc(collection(db, 'todos'), {
      todoTitle: todoTitle.value,
      todoDetail: todoDetail.value,
      startDate: selected.value.start,
      targetDate: selected.value.end,
      isCompleted: false,
    }).then(() => {
      toast.add({
        title: 'タスクを作成しました。',
        icon: 'i-heroicons-check-circle',
        timeout: 3000,
      });
      // モーダルを閉じる
      addTodoModalIsOpen.value = false;

      // ユーザーが入力した値をリセット
      todoTitle.value = '';
      todoDetail.value = '';

      count.value++;
      emits('addTodo', count.value);
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    toast.add({
      title: 'タスクを作成できませんでした。',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'red',
      timeout: 3000,
    });
  }
};

// タスク名が入力されていないときにエラー文を表示させる
watch(todoTitle, (newValue) => {
  if (newValue !== '') {
    isError.value = false;
  }
});
watch(addTodoModalIsOpen, (newValue) => {
  if (!newValue) {
    isError.value = false;
  }
});
</script>
<template>
  <div class="px-10 py-20 height-[100%] bg-slate-200">
    <div class="bg-white p-6 rounded-md">
      <div>
        <p>タスクを作成</p>
        <UInput v-model="todoTitle" placeholder="タスク名を入力" />
      </div>
      <div class="mt-8">
        <UButton
          label="タスクを作成する"
          block
          @click="addTodoModalIsOpen = true"
        />
        <UModal v-model="addTodoModalIsOpen">
          <div class="p-4">
            <div>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark-20-solid"
                class="absolute top-0 right-0"
                @click="addTodoModalIsOpen = false"
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
              <div v-if="isError" class="text-red-500">
                タスク名が入力されていません。タスク名を入力してください。
              </div>
            </div>
          </div>
        </UModal>
      </div>
    </div>
  </div>
</template>
