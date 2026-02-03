<template>
  <div class="favorites-view p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Favorite Conversions</h1>

      <div v-if="favorites.length === 0" class="text-center py-12">
        <p class="text-gray-500">No favorites yet</p>
        <router-link to="/" class="text-blue-500 hover:underline mt-4 inline-block">
          Start converting text
        </router-link>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="item in favorites"
          :key="item.id"
          class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="flex-1">
              <h3 class="font-semibold text-lg">{{ item.title || 'Untitled' }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Favorited on: {{ formatDate(item.favoritedAt) }}
              </p>
            </div>
            <div class="flex gap-2">
              <button
                @click="playSpeech(item)"
                class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm"
              >
                Play
              </button>
              <button
                @click="removeFavorite(item.id)"
                class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
              >
                Remove
              </button>
            </div>
          </div>

          <div class="text-gray-700 dark:text-gray-300 mb-2">
            {{ truncateText(item.inputText, 150) }}
          </div>

          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">
              {{ item.inputText.length }} chars
            </span>
            <span v-if="item.language" class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {{ item.language }}
            </span>
            <span v-if="item.rate" class="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
              {{ item.rate }}x rate
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const favorites = computed(() => userStore.favorites)

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString()
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

function playSpeech(item: any) {
  const utterance = new SpeechSynthesisUtterance(item.inputText)
  if (item.language) utterance.lang = item.language
  if (item.rate) utterance.rate = item.rate
  if (item.pitch) utterance.pitch = item.pitch
  speechSynthesis.speak(utterance)
}

function removeFavorite(id: string) {
  if (confirm('Remove this item from favorites?')) {
    userStore.removeFromFavorites(id)
  }
}
</script>
