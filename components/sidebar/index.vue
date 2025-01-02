<script setup lang="ts">
import { collection, addDoc, Firestore } from 'firebase/firestore';
import { format } from 'date-fns';

let db: Firestore;
const addTodoModalIsOpen = ref(false);
const isTaskTitleEmpty = ref(false);
const isAddingTodo = ref(false);
const todoTitle = ref<string>('');
const todoDetail = ref<string>('');
const count = ref(0);
const toast = useToast();
const selected = ref({
  start: new Date(),
  end: new Date(),
});

interface Emits {
  (e: 'addTodo', v: number): void;
}

const emits = defineEmits<Emits>();

onMounted(() => {
  const { $firebase } = useNuxtApp();
  db = $firebase.db;
});

const addTodo = async () => {
  if (isAddingTodo.value) return; // 二重処理防止
  if (todoTitle.value === '') {
    isTaskTitleEmpty.value = true;
    return;
  }
  isAddingTodo.value = true;
  try {
    await addDoc(collection(db, 'todos'), {
      todoTitle: todoTitle.value,
      todoDetail: todoDetail.value,
      startDate: selected.value.start,
      targetDate: selected.value.end,
      isCompleted: false,
    });
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
    isTaskTitleEmpty.value = false;

    count.value++;
    emits('addTodo', count.value);
  } catch (error) {
    toast.add({
      title: 'タスクを作成できませんでした。',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'red',
      timeout: 5000,
    });
  } finally {
    isAddingTodo.value = false; // 処理完了後にボタンを有効化
  }
};

// タスク名が入力されていないときにエラー文を表示させる
watch(todoTitle, (newValue) => {
  if (newValue !== '') {
    isTaskTitleEmpty.value = false;
  }
});
watch(addTodoModalIsOpen, (newValue) => {
  if (!newValue) {
    isTaskTitleEmpty.value = false;
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
                v-model.lazy="todoTitle"
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
                :label="isAddingTodo ? '作成中...' : 'タスクを作成する'"
                block
                class="mt-6"
                :disabled="isAddingTodo"
                @click="addTodo"
              />
              <div v-if="isTaskTitleEmpty" class="text-red-500">
                タスク名が入力されていません。タスク名を入力してください。
              </div>
            </div>
          </div>
        </UModal>
      </div>
    </div>
  </div>
</template>
