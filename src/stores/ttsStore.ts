import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useTtsStore = defineStore('tts', {
  state: () => ({
    settings: {
      voice: '',
      pitch: useLocalStorage('tts-pitch', 1),
      rate: useLocalStorage('tts-rate', 1),
      volume: useLocalStorage('tts-volume', 1),
    },
    history: useLocalStorage('tts-history', [] as any[]),
  }),
  actions: {
    addToHistory(text: string, voice: string) {
      this.history.unshift({
        id: Math.random().toString(36).substr(2, 9),
        text,
        voice,
        timestamp: new Date().toISOString()
      })
      if (this.history.length > 10) this.history.pop()
    },
    clearHistory() {
      this.history = []
    }
  }
})
