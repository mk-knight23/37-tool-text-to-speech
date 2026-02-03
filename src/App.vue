<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header Navigation -->
    <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <nav class="max-w-6xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <router-link to="/" class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                <Volume2 :size="20" />
              </div>
              <div>
                <h1 class="text-xl font-bold text-gray-900 dark:text-white">VoiceFlow</h1>
                <p class="text-xs text-gray-500 dark:text-gray-400">Text to Speech</p>
              </div>
            </router-link>
          </div>

          <div class="flex items-center gap-2">
            <router-link
              to="/"
              class="nav-link"
              active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            >
              <Home :size="18" />
              <span class="hidden sm:inline">Convert</span>
            </router-link>
            <router-link
              to="/history"
              class="nav-link"
              active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            >
              <HistoryIcon :size="18" />
              <span class="hidden sm:inline">History</span>
            </router-link>
            <router-link
              to="/favorites"
              class="nav-link"
              active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            >
              <Heart :size="18" />
              <span class="hidden sm:inline">Favorites</span>
            </router-link>
            <router-link
              to="/settings"
              class="nav-link"
              active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            >
              <Settings :size="18" />
              <span class="hidden sm:inline">Settings</span>
            </router-link>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main>
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-200 dark:border-gray-700 mt-12">
      <div class="max-w-6xl mx-auto px-4 py-6 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Made by MK — Musharraf Kazi
        </p>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Works entirely in your browser. No data is sent to any server.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Volume2, Home, History as HistoryIcon, Heart, Settings } from 'lucide-vue-next'
</script>

<style scoped>
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  color: rgb(107, 114, 128);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover {
  background-color: rgb(243, 244, 246);
}

.dark .nav-link {
  color: rgb(156, 163, 175);
}

.dark .nav-link:hover {
  background-color: rgb(55, 65, 81);
}
</style>
