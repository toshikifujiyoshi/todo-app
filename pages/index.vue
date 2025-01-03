<script setup lang="ts">
import { onMounted } from 'vue';
import {
  getDocs,
  collection,
  doc,
  deleteDoc,
  updateDoc,
  Firestore,
} from 'firebase/firestore';
import { sub, format } from 'date-fns';
import { ja } from 'date-fns/locale';

definePageMeta({
  layout: 'is-sidebar',
});

let db: Firestore;
type DocumentData = {
  field: {
    todoTitle: string;
    todoDetail: string;
    startDate: Date;
    targetDate: Date;
    isCompleted: boolean;
  };
  id: string;
};
const todos = ref<DocumentData[]>([]);
const toast = useToast();
const selected = ref({
  start: sub(new Date(), { days: undefined }),
  end: new Date(),
});
const isTaskTitleEmpty = ref(false);
const isSavingEdit = ref(false);
const isDeletingTodo = ref(false);

// ソート機能
const statuses = ['全選択', '完了のみ', '進行中のみ'];
const status = ref(statuses[0]);
const sortByDates = ['完了日・昇順', '完了日・降順'];
const sortByDate = ref(sortByDates[0]);

// ページネーション
const page = ref(1);
const pageCount = ref(10);

// タスクデータの取得
onMounted(async () => {
  const { $firebase } = useNuxtApp();
  db = $firebase.db;

  try {
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
  } catch (error) {
    toast.add({
      title: 'タスクを取得できませんでした。',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'red',
      timeout: 3000,
    });
  }
});

const editTodoModalIsOpen = ref(false);
const editedTodo = ref<DocumentData>({
  field: {
    todoTitle: '',
    todoDetail: '',
    startDate: new Date(),
    targetDate: new Date(),
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

// タスクを削除する関数
const deleteTodo = async (todoId: string) => {
  if (isDeletingTodo.value) return; // 二重処理防止
  isDeletingTodo.value = true;
  try {
    // todoId に対応するドキュメントを削除
    await deleteDoc(doc(db, 'todos', todoId)).then(async () => {
      // 削除完了後タスクを更新する
      todos.value.length = 0;
      const querySnapshot = await getDocs(collection(db, 'todos'));
      querySnapshot.forEach((doc) =>
        todos.value.push({
          field: {
            todoTitle: doc.data().todoTitle,
            todoDetail: doc.data().todoDetail,
            startDate: doc.data().startDate.toDate(),
            targetDate: doc.data().targetDate.toDate(),
            isCompleted: doc.data().isCompleted,
          },
          id: doc.id,
        })
      );
      // 削除完了をスナックバーにて通知
      toast.add({
        title: 'タスクを削除しました。',
        icon: 'i-heroicons-check-circle',
        timeout: 3000,
      });
    });
  } catch (error) {
    toast.add({
      title: 'タスクを削除できませんでした。',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'red',
      timeout: 3000,
    });
  } finally {
    isDeletingTodo.value = false; // 処理完了後にボタンを有効化
  }
};

// 編集を保存する関数
const saveEdit = async (todoId: string) => {
  if (isSavingEdit.value) return; // 二重処理防止
  if (editedTodo.value.field.todoTitle === '') {
    isTaskTitleEmpty.value = true;
    return;
  }
  isSavingEdit.value = true;
  try {
    await updateDoc(doc(db, 'todos', todoId), {
      todoTitle: editedTodo.value.field.todoTitle,
      todoDetail: editedTodo.value.field.todoDetail,
      startDate: selected.value.start,
      targetDate: selected.value.end,
      isCompleted: editedTodo.value.field.isCompleted,
    }).then(async () => {
      // 編集完了をスナックバーにて通知
      toast.add({
        title: 'タスクの編集が完了しました。',
        icon: 'i-heroicons-check-circle',
        timeout: 3000,
      });
      // 編集完了後タスクを更新する
      todos.value.length = 0;
      const querySnapshot = await getDocs(collection(db, 'todos'));
      querySnapshot.forEach((doc) =>
        todos.value.push({
          field: {
            todoTitle: doc.data().todoTitle,
            todoDetail: doc.data().todoDetail,
            startDate: doc.data().startDate.toDate(),
            targetDate: doc.data().targetDate.toDate(),
            isCompleted: doc.data().isCompleted,
          },
          id: doc.id,
        })
      );
      // モーダルを閉じる
      editTodoModalIsOpen.value = false;
    });
  } catch (error) {
    toast.add({
      title: 'タスクを編集できませんでした。',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'red',
      timeout: 3000,
    });
  } finally {
    isSavingEdit.value = false; // 処理完了後にボタンを有効化
  }
};

// タスク名が入力されていないときにエラー文を表示させる
watch(
  () => editedTodo.value.field.todoTitle,
  (newValue) => {
    if (newValue !== '') {
      isTaskTitleEmpty.value = false;
    }
  }
);
watch(editTodoModalIsOpen, (newValue) => {
  if (!newValue) {
    isTaskTitleEmpty.value = false;
  }
});

// ソート機能
const sortedTodos = computed(() => {
  let processedTodos = todos.value;

  // ステータスでフィルタリング
  if (status.value === '完了のみ') {
    processedTodos = processedTodos.filter((todo) => todo.field.isCompleted);
  } else if (status.value === '進行中のみ') {
    processedTodos = processedTodos.filter((todo) => !todo.field.isCompleted);
  }

  // 日付でソート
  processedTodos = processedTodos.sort((a, b) => {
    if (sortByDate.value === '完了日・昇順') {
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

  return processedTodos;
});

// ソート後にページ、アコーディオンをリセット
const accordionKey = ref(0);
watch([status, sortByDate], () => {
  page.value = 1; // ページリセット
  accordionKey.value += 1; // アコーディオンリセット
});

const displayTodos = computed(() => {
  return sortedTodos.value.slice(
    pageCount.value * (page.value - 1),
    pageCount.value * page.value
  );
});
</script>

<template>
  <div class="px-10 py-20 h-[100%] w-[100%] bg-slate-400">
    <div class="bg-white rounded-md p-4 text-lg">
      <h2 class="font-bold mb-2">タスク一覧</h2>
      <div>
        <div class="my-2 text-center flex items-center justify-between">
          <p>並び替え・絞り込み</p>
          <div class="flex">
            <USelect v-model="sortByDate" :options="sortByDates" />
            <USelect v-model="status" :options="statuses" class="ml-6" />
          </div>
        </div>
      </div>
      <div>
        <div v-if="displayTodos.length !== 0" :key="accordionKey">
          <UAccordion
            multiple
            color="black"
            variant="link"
            size="xl"
            :items="displayTodos"
          >
            <template #default="{ item, open }">
              <UButton
                color="gray"
                variant="ghost"
                class="flex justify-between border-b border-gray-200 dark:border-gray-700"
                :ui="{ rounded: 'rounded-none', padding: { sm: 'p-3' } }"
              >
                <template #leading>
                  <div class="flex items-center">
                    <div class="w-[60px] mr-4 text-center">
                      <UBadge
                        variant="subtle"
                        color="emerald"
                        :label="item.field.isCompleted ? '完了' : '進行中'"
                        :class="
                          !item.field.isCompleted
                            ? 'text-orange-500 bg-orange-50 ring-orange-500'
                            : ''
                        "
                      />
                    </div>
                    <p class="text-black font-bold">
                      {{ item.field.todoTitle }}
                    </p>
                  </div>
                </template>

                <template #trailing>
                  <div class="flex items-center">
                    <UBadge
                      icon="i-heroicons-calendar-days-20-solid"
                      variant="soft"
                      :color="
                        item.field.targetDate.getTime() <
                        new Date().setHours(0, 0, 0, 0)
                          ? 'red'
                          : 'primary'
                      "
                      :class="
                        item.field.targetDate.getTime() <
                        new Date().setHours(0, 0, 0, 0)
                          ? 'bg-red-50'
                          : ' hover:bg-primary-50'
                      "
                    >
                      〜{{
                        format(item.field.targetDate, 'yyyy年M月d日', {
                          locale: ja,
                        })
                      }}
                    </UBadge>
                    <UIcon
                      name="i-heroicons-chevron-right-20-solid"
                      class="w-5 h-5 transform transition-transform duration-200"
                      :class="[open && 'rotate-90']"
                    />
                  </div>
                </template>
              </UButton>
            </template>
            <template #item="{ item }">
              <div class="p-4 text-black">
                <div>
                  <p class="font-bold">タスクの詳細</p>
                  <p v-if="item.field.todoDetail" class="mt-2">
                    {{ item.field.todoDetail }}
                  </p>
                  <p v-else class="mt-2">タスクの詳細が設定されていません。</p>
                </div>
                <div class="flex justify-between mt-6">
                  <div>
                    <p class="font-bold">タスクの期限</p>
                    <UBadge
                      icon="i-heroicons-calendar-days-20-solid"
                      variant="soft"
                      :color="
                        item.field.targetDate.getTime() <
                        new Date().setHours(0, 0, 0, 0)
                          ? 'red'
                          : 'primary'
                      "
                      class="mt-2"
                      :class="
                        item.field.targetDate.getTime() <
                        new Date().setHours(0, 0, 0, 0)
                          ? 'bg-red-50'
                          : ' hover:bg-primary-50'
                      "
                    >
                      {{
                        format(item.field.startDate, 'yyyy年M月d日', {
                          locale: ja,
                        })
                      }}
                      〜
                      {{
                        format(item.field.targetDate, 'yyyy年M月d日', {
                          locale: ja,
                        })
                      }}
                    </UBadge>
                  </div>
                  <div>
                    <UButton
                      label="編集する"
                      @click="
                        openModal(
                          item.field.todoTitle,
                          item.field.todoDetail,
                          item.field.startDate,
                          item.field.targetDate,
                          item.field.isCompleted,
                          item.id
                        )
                      "
                    />
                    <UButton
                      :disabled="isDeletingTodo"
                      :label="isDeletingTodo ? '削除中...' : '削除する'"
                      block
                      class="mt-2"
                      color="rose"
                      @click="deleteTodo(item.id)"
                    />
                  </div>
                </div>
              </div>
            </template>
          </UAccordion>
          <UPagination
            v-model="page"
            :page-count="10"
            :total="sortedTodos.length"
            class="mt-6"
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
                    :label="isSavingEdit ? '保存中...' : '編集を保存する'"
                    block
                    :disabled="isSavingEdit"
                    @click="saveEdit(editedTodo.id)"
                  />
                  <div v-if="isTaskTitleEmpty" class="text-red-500">
                    タスク名が入力されていません。タスク名を入力してください。
                  </div>
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
