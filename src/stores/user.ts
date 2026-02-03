import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // User profile
  const profile = ref({
    name: 'Guest',
    language: 'en-US',
    voice: 'default',
    rate: 1.0,
    pitch: 1.0
  })

  // Settings
  const settings = ref({
    theme: 'light',
    autoPlay: false,
    showHighlights: true,
    saveHistory: true,
    maxHistoryItems: 100
  })

  // Statistics
  const stats = ref({
    totalConversions: 0,
    totalCharacters: 0,
    uniqueWords: new Set(),
    languagesUsed: new Set(),
    favoritesCount: 0
  })

  // Favorites
  const favorites = ref<any[]>([])

  // History
  const history = ref<any[]>([])

  // Computed
  const isAuthenticated = computed(() => !!profile.value.name)
  const theme = computed(() => settings.value.theme)

  // Actions
  function updateProfile(updates: Partial<typeof profile.value>) {
    Object.assign(profile.value, updates)
  }

  function updateSettings(updates: Partial<typeof settings.value>) {
    Object.assign(settings.value, updates)
    if (updates.theme) {
      document.documentElement.classList.toggle('theme-dark', updates.theme === 'dark')
    }
  }

  function addToHistory(item: { id: string; inputText: string; title?: string; language?: string }) {
    if (!settings.value.saveHistory) return

    history.value.unshift({
      ...item,
      timestamp: new Date().toISOString()
    } as any)

    // Limit history size
    if (history.value.length > settings.value.maxHistoryItems) {
      history.value = history.value.slice(0, settings.value.maxHistoryItems)
    }
  }

  function addToFavorites(item: any) {
    const exists = favorites.value.find(f => f.id === item.id)
    if (!exists) {
      favorites.value.push(item)
      stats.value.favoritesCount++
    }
  }

  function removeFromFavorites(id: string) {
    const index = favorites.value.findIndex(f => f.id === id)
    if (index !== -1) {
      favorites.value.splice(index, 1)
      stats.value.favoritesCount--
    }
  }

  function toggleFavorite(item: any): boolean {
    const exists = favorites.value.find(f => f.id === item.id)
    if (exists) {
      removeFromFavorites(item.id)
      return false
    } else {
      addToFavorites(item)
      return true
    }
  }

  function updateStats(charCount: number, wordCount: string[], lang?: string) {
    stats.value.totalConversions++
    stats.value.totalCharacters += charCount
    wordCount.forEach(word => stats.value.uniqueWords.add(word))
    if (lang) stats.value.languagesUsed.add(lang)
  }

  function clearHistory() {
    history.value = []
  }

  function clearFavorites() {
    favorites.value = []
    stats.value.favoritesCount = 0
  }

  function reset() {
    profile.value = {
      name: 'Guest',
      language: 'en-US',
      voice: 'default',
      rate: 1.0,
      pitch: 1.0
    }
    settings.value = {
      theme: 'light',
      autoPlay: false,
      showHighlights: true,
      saveHistory: true,
      maxHistoryItems: 100
    }
    stats.value = {
      totalConversions: 0,
      totalCharacters: 0,
      uniqueWords: new Set(),
      languagesUsed: new Set(),
      favoritesCount: 0
    }
    favorites.value = []
    history.value = []
  }

  return {
    profile,
    settings,
    stats,
    favorites,
    history,
    isAuthenticated,
    theme,
    updateProfile,
    updateSettings,
    addToHistory,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    updateStats,
    clearHistory,
    clearFavorites,
    reset
  }
})
