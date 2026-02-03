<template>
  <div class="settings-view p-6">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Settings</h1>

      <!-- Profile Section -->
      <section class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Profile</h2>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Name</label>
              <input
                v-model="userStore.profile.name"
                type="text"
                class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Language</label>
              <select
                v-model="userStore.profile.language"
                class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
                <option value="it-IT">Italian</option>
                <option value="pt-BR">Portuguese</option>
                <option value="ja-JP">Japanese</option>
                <option value="ko-KR">Korean</option>
                <option value="zh-CN">Chinese (Simplified)</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Voice Rate: {{ userStore.profile.rate }}x</label>
              <input
                v-model.number="userStore.profile.rate"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                class="w-full"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Voice Pitch: {{ userStore.profile.pitch }}x</label>
              <input
                v-model.number="userStore.profile.pitch"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Preferences Section -->
      <section class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Preferences</h2>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Dark Mode</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Use dark theme across the app</p>
              </div>
              <button
                @click="toggleTheme"
                :class="userStore.settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'"
                class="px-4 py-2 rounded-lg transition"
              >
                {{ userStore.settings.theme === 'dark' ? 'On' : 'Off' }}
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Auto-Play Speech</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Automatically play speech when text is converted</p>
              </div>
              <button
                @click="userStore.updateSettings({ autoPlay: !userStore.settings.autoPlay })"
                :class="userStore.settings.autoPlay ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'"
                class="px-4 py-2 rounded-lg transition"
              >
                {{ userStore.settings.autoPlay ? 'On' : 'Off' }}
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Save History</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Keep track of your conversions</p>
              </div>
              <button
                @click="userStore.updateSettings({ saveHistory: !userStore.settings.saveHistory })"
                :class="userStore.settings.saveHistory ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'"
                class="px-4 py-2 rounded-lg transition"
              >
                {{ userStore.settings.saveHistory ? 'On' : 'Off' }}
              </button>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Max History Items: {{ userStore.settings.maxHistoryItems }}</label>
              <input
                v-model.number="userStore.settings.maxHistoryItems"
                type="number"
                min="10"
                max="500"
                class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Your Statistics</h2>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
          <dl class="grid grid-cols-2 gap-4">
            <div class="border-l-4 border-blue-500 pl-4">
              <dt class="text-sm text-gray-500">Total Conversions</dt>
              <dd class="text-2xl font-bold">{{ userStore.stats.totalConversions }}</dd>
            </div>
            <div class="border-l-4 border-green-500 pl-4">
              <dt class="text-sm text-gray-500">Characters Converted</dt>
              <dd class="text-2xl font-bold">{{ userStore.stats.totalCharacters.toLocaleString() }}</dd>
            </div>
            <div class="border-l-4 border-purple-500 pl-4">
              <dt class="text-sm text-gray-500">Unique Words</dt>
              <dd class="text-2xl font-bold">{{ userStore.stats.uniqueWords.size }}</dd>
            </div>
            <div class="border-l-4 border-orange-500 pl-4">
              <dt class="text-sm text-gray-500">Favorites</dt>
              <dd class="text-2xl font-bold">{{ userStore.stats.favoritesCount }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <!-- Data Management -->
      <section>
        <h2 class="text-lg font-semibold mb-4">Data Management</h2>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
          <div class="space-y-4">
            <button
              @click="exportData"
              class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Export All Data
            </button>
            <button
              @click="confirmReset"
              class="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Reset All Data
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

function toggleTheme() {
  const newTheme = userStore.settings.theme === 'light' ? 'dark' : 'light'
  userStore.updateSettings({ theme: newTheme })
}

function exportData() {
  const data = {
    profile: userStore.profile,
    settings: userStore.settings,
    stats: {
      ...userStore.stats,
      uniqueWords: Array.from(userStore.stats.uniqueWords),
      languagesUsed: Array.from(userStore.stats.languagesUsed)
    },
    favorites: userStore.favorites,
    history: userStore.history,
    exportDate: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `text-to-speech-data-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function confirmReset() {
  if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
    userStore.reset()
  }
}
</script>
