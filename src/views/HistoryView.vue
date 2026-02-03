<template>
  <div class="history-view p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Conversion History</h1>

      <div class="flex justify-between items-center mb-4">
        <p class="text-gray-600 dark:text-gray-400">
          {{ history.length }} conversions
        </p>
        <button
          @click="userStore.clearHistory()"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Clear History
        </button>
      </div>

      <div v-if="history.length === 0" class="text-center py-12">
        <p class="text-gray-500">No history yet</p>
        <router-link to="/" class="text-blue-500 hover:underline mt-4 inline-block">
          Start converting text
        </router-link>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="item in history"
          :key="item.id"
          class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700"
        >
          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="font-semibold text-lg">{{ item.title || 'Untitled' }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(item.timestamp) }}
              </p>
            </div>
            <button
              @click="router.push(`/?text=${encodeURIComponent(item.inputText)}`)"
              class="text-blue-500 hover:text-blue-600 text-sm"
            >
              Convert Again
            </button>
          </div>

          <div class="text-gray-700 dark:text-gray-300 mb-2">
            {{ truncateText(item.inputText, 100) }}
          </div>

          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">
              {{ item.inputText.length }} chars
            </span>
            <span v-if="item.language" class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {{ item.language }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()

const userStore = useUserStore()
const history = computed(() => userStore.history)

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString()
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>
