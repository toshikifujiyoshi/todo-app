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
import { ja } from 'date-fns/locale';

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

const editTodoModalIsOpen = ref(false);
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

// 編集モーダルを開く関数
const openModal = (
  todoTitle: string,
  todoDetail: string,
  startDate: any,
  targetDate: any,
  isCompleted: boolean,
  id: string
) => {
  editTodoModalIsOpen.value = true;
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
  editTodoModalIsOpen.value = false;
};

// 編集を保存する関数
const saveEdit = async (todoId: string) => {
  if (editedTodo.value.field.todoTitle === '') {
    isError.value = true;
    return;
  }
  try {
    await updateDoc(doc(db, 'todos', todoId), {
      todoTitle: editedTodo.value.field.todoTitle,
      todoDetail: editedTodo.value.field.todoDetail,
      startDate: selected.value.start,
      targetDate: selected.value.end,
      isCompleted: editedTodo.value.field.isCompleted,
    }).then(async () => {
      // todoを保存後タスクをtodoを更新する
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
      editTodoModalIsOpen.value = false;
    });
  } catch (error) {
    console.error('Error updating todo:', error);
  }
};

// ページネーション
const page = ref(1);
const pageCount = ref(10);

// ソート機能
const statuses = ['全選択', '完了', '進行中'];
const status = ref(statuses[0]);
const sortByDates = ['昇順', '降順'];
const sortByDate = ref(sortByDates[0]);

const statusFilteredTodos = computed(() => {
  if (status.value === '完了') {
    return todos.value.filter((todo) => todo.field.isCompleted);
  } else if (status.value === '進行中') {
    return todos.value.filter((todo) => !todo.field.isCompleted);
  } else {
    return todos.value;
  }
});

const targetDateSortedTodos = computed(() => {
  page.value = 1;
  return statusFilteredTodos.value.sort((a, b) => {
    if (sortByDate.value === '昇順') {
      return (
        new Date(a.field.targetDate).getTime() -
        new Date(b.field.targetDate).getTime()
      );
    } else {
      return (
        new Date(b.field.targetDate).getTime() -
        new Date(a.field.targetDate).getTime()
      );
    }
  });
});

const displayTodos = computed(() => {
  return targetDateSortedTodos.value.slice(
    pageCount.value * (page.value - 1),
    pageCount.value * page.value
  );
});

// タスク名が入力されていないときにエラー文を表示させる
const isError = ref(false);

watch(
  () => editedTodo.value.field.todoTitle,
  (newValue) => {
    if (newValue !== '') {
      isError.value = false;
    }
  }
);
watch(editTodoModalIsOpen, (newValue) => {
  if (!newValue) {
    isError.value = false;
  }
});
</script>

<template>
  <div class="px-10 py-20 h-[100%] w-[100%] bg-slate-400">
    <div class="bg-white rounded-md p-4 text-lg">
      <h2 class="font-bold mb-2">タスク一覧</h2>
      <div>
        <div class="my-2 text-center flex justify-between">
          <p>絞り込み</p>
          <USelect v-model="sortByDate" :options="sortByDates" />
          <USelect v-model="status" :options="statuses" />
        </div>
      </div>
      <div>
        <div v-if="displayTodos.length !== 0">
          <div
            v-for="displayTodo in displayTodos"
            :key="displayTodo.id"
            class="flex justify-between p-2 border-t"
          >
            <div class="flex">
              <div class="w-[60px] mr-4 text-center">
                <UBadge
                  variant="subtle"
                  color="emerald"
                  :label="displayTodo.field.isCompleted ? '完了' : '進行中'"
                  :class="
                    !displayTodo.field.isCompleted
                      ? 'text-orange-500 bg-orange-50 ring-orange-500'
                      : ''
                  "
                />
              </div>
              <p class="text-black">{{ displayTodo.field.todoTitle }}</p>
            </div>
            <UButton
              icon="i-heroicons-calendar-days-20-solid"
              variant="soft"
              :color="
                displayTodo.field.targetDate < new Date() ? 'red' : 'primary'
              "
              class="cursor-default"
              :class="
                displayTodo.field.targetDate < new Date()
                  ? 'bg-red-50'
                  : ' hover:bg-primary-50'
              "
            >
              〜{{
                format(displayTodo.field.targetDate, 'yyyy年M月d日', {
                  locale: ja,
                })
              }}
            </UButton>
            <UButton
              label="編集する"
              class="ml-2"
              @click="
                openModal(
                  displayTodo.field.todoTitle,
                  displayTodo.field.todoDetail,
                  displayTodo.field.startDate,
                  displayTodo.field.targetDate,
                  displayTodo.field.isCompleted,
                  displayTodo.id
                )
              "
            />
          </div>
          <UPagination
            v-model="page"
            :page-count="10"
            :total="targetDateSortedTodos.length"
          />

          <UModal v-model="editTodoModalIsOpen">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="absolute top-0 right-0"
              @click="editTodoModalIsOpen = false"
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
                    class="mt-2 w-[240px]"
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
                  <div v-if="isError" class="text-red-500">
                    タスク名が入力されていません。タスク名を入力してください。
                  </div>
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
