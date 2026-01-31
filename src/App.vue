<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTtsStore } from './stores/ttsStore'
import { useSettingsStore } from './stores/settings'
import { useStatsStore } from './stores/stats'
import { useAudio } from './composables/useAudio'
// import SettingsPanel from './components/ui/SettingsPanel.vue'
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  History as HistoryIcon,
  Settings2,
  Volume2,
  Languages,
  Github,
  Info,
  Upload,
  X
} from 'lucide-vue-next'

const store = useTtsStore()
const settingsStore = useSettingsStore()
const statsStore = useStatsStore()
const audio = useAudio()

const text = ref('Hello, welcome to VoiceFlow. Enter your text here to begin speech synthesis.')
const isSpeaking = ref(false)
const voices = ref<SpeechSynthesisVoice[]>([])
const selectedVoice = ref<SpeechSynthesisVoice | null>(null)

const synth = window.speechSynthesis

const loadVoices = () => {
  const allVoices = synth.getVoices().sort((a, b) => a.lang.localeCompare(b.lang))
  voices.value = allVoices
  if (allVoices.length && !selectedVoice.value) {
    selectedVoice.value = allVoices.find(v => v.lang.includes('en')) || allVoices[0] || null
  }
}

onMounted(() => {
  settingsStore.loadSettings()
  statsStore.loadStats()
  statsStore.recordVisit()
  loadVoices()
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices
  }
})

const speak = () => {
  audio.playClick()
  if (isSpeaking.value) {
    synth.cancel()
    isSpeaking.value = false
    return
  }
  if (!text.value) return

  const utterance = new SpeechSynthesisUtterance(text.value)
  if (selectedVoice.value) utterance.voice = selectedVoice.value
  utterance.pitch = store.settings.pitch
  utterance.rate = store.settings.rate
  utterance.volume = store.settings.volume

  utterance.onstart = () => {
    isSpeaking.value = true
  }
  utterance.onend = () => {
    isSpeaking.value = false
    statsStore.recordSpeechGeneration(text.value.length)
    audio.playSuccess()
  }
  utterance.onerror = () => {
    isSpeaking.value = false
    audio.playError()
  }

  synth.speak(utterance)
  store.addToHistory(text.value, selectedVoice.value?.name || 'Default')
}

const stop = () => {
  audio.playClick()
  synth.cancel()
  isSpeaking.value = false
}

const openSettings = () => {
  audio.playClick()
  statsStore.recordSettingsOpen()
}

const recordClick = () => {
  statsStore.recordClick()
}

const waveformBars = [1, 2, 3, 4, 5, 6, 7, 8]

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Only accept text files
  if (!file.type.startsWith('text/') && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
    alert('Please upload a text file (.txt or .md)')
    return
  }

  // Check file size (max 100KB)
  if (file.size > 100 * 1024) {
    alert('File size must be less than 100KB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    if (content) {
      text.value = content.slice(0, 5000) // Limit to 5000 chars
      audio.playClick()
    }
  }
  reader.readAsText(file)
  input.value = '' // Reset input
}
</script>

<template>
  <div class="min-h-screen" :class="{ 'dark': settingsStore.isDarkMode, 'light': !settingsStore.isDarkMode }">
    <!-- Skip to main content link for accessibility -->
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <!-- Header -->
    <header class="border-b border-voice-border">
      <nav class="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-voice-primary rounded-xl flex items-center justify-center text-white">
            <Volume2 :size="24" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-voice-text">VoiceFlow</h1>
            <p class="text-sm text-voice-muted">Text to Speech</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <button
            @click="openSettings"
            class="voice-btn-secondary p-3"
            aria-label="Open settings"
          >
            <Info :size="20" />
          </button>
          <a
            href="https://github.com/mk-knight23/50-Text-To-Speech-Web-App"
            target="_blank"
            rel="noopener noreferrer"
            class="voice-btn-secondary p-3"
            aria-label="View source on GitHub"
          >
            <Github :size="20" />
          </a>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main id="main-content" class="max-w-4xl mx-auto px-6 py-12">
      <!-- Page Title -->
      <div class="mb-12 text-center">
        <h2 class="text-4xl font-bold text-voice-text mb-4">
          Text to Speech
        </h2>
        <p class="text-lg text-voice-secondary max-w-xl mx-auto">
          Convert any text into spoken words using your browser's built-in speech synthesis.
          Simple, accessible, and free.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Editor -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Text Input -->
          <div class="voice-card">
            <div class="flex items-center justify-between mb-3">
              <label for="text-input" class="block text-sm font-semibold text-voice-secondary">
                Enter text to speak
              </label>
              <div class="flex items-center gap-2">
                <input
                  type="file"
                  id="file-upload"
                  accept=".txt,.md,text/*"
                  @change="handleFileUpload"
                  class="hidden"
                />
                <label
                  for="file-upload"
                  class="voice-btn-secondary text-xs px-3 py-1 cursor-pointer flex items-center gap-1"
                >
                  <Upload :size="14" />
                  Upload .txt
                </label>
                <button
                  v-if="text"
                  @click="text = ''"
                  class="voice-btn-secondary text-xs px-3 py-1 flex items-center gap-1"
                  aria-label="Clear text"
                >
                  <X :size="14" />
                  Clear
                </button>
              </div>
            </div>
            <textarea
              id="text-input"
              v-model="text"
              @click="recordClick"
              class="voice-textarea w-full"
              placeholder="Type, paste, or upload your content here..."
              aria-describedby="char-count"
            ></textarea>
            <div id="char-count" class="mt-3 text-sm text-voice-muted">
              {{ text.length }} characters
            </div>
          </div>

          <!-- Playback Controls -->
          <div class="voice-card">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
              <!-- Play/Pause Button -->
              <button
                @click="speak"
                @click.capture="recordClick"
                class="voice-btn-primary flex-shrink-0"
                :aria-label="isSpeaking ? 'Pause speech' : 'Start speech'"
              >
                <Pause v-if="isSpeaking" :size="24" fill="currentColor" />
                <Play v-else :size="24" fill="currentColor" />
                <span>{{ isSpeaking ? 'Pause' : 'Speak' }}</span>
              </button>

              <!-- Waveform Visualization -->
              <div
                class="voice-waveform flex-1"
                :class="{ 'voice-speaking': isSpeaking }"
                aria-hidden="true"
              >
                <div
                  v-for="i in waveformBars"
                  :key="i"
                  class="voice-waveform-bar"
                  :style="{ animationDelay: `${i * 0.1}s` }"
                ></div>
              </div>

              <!-- Stop Button -->
              <button
                @click="stop"
                @click.capture="recordClick"
                class="voice-btn-secondary flex-shrink-0"
                aria-label="Stop speech"
              >
                <Square :size="20" fill="currentColor" />
                <span class="sr-only">Stop</span>
              </button>
            </div>
          </div>

          <!-- Voice Status Announcement -->
          <div
            v-if="isSpeaking"
            role="status"
            aria-live="polite"
            class="voice-card bg-voice-primary/10 border-voice-primary"
          >
            <div class="flex items-center justify-center gap-3 py-3">
              <div class="voice-waveform-mini">
                <div
                  v-for="i in 3"
                  :key="i"
                  class="voice-waveform-bar-mini"
                  :style="{ animationDelay: `${i * 0.15}s` }"
                ></div>
              </div>
              <span class="text-sm font-medium text-voice-primary">Speaking...</span>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Voice Selection -->
          <div class="voice-card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold text-voice-secondary flex items-center gap-2">
                <Languages :size="18" />
                Voice
              </h3>
              <button
                @click="loadVoices"
                class="text-voice-primary hover:underline text-sm"
                aria-label="Refresh voices"
              >
                <RotateCcw :size="16" />
              </button>
            </div>
            <select
              v-model="selectedVoice"
              @click="recordClick"
              class="voice-select w-full"
              aria-label="Select voice"
            >
              <option v-for="voice in voices" :key="voice.name" :value="voice">
                {{ voice.name }} ({{ voice.lang }})
              </option>
            </select>
            <p class="mt-3 text-sm text-voice-muted">
              {{ voices.length }} voices available
            </p>
          </div>

          <!-- Speech Controls -->
          <div class="voice-card">
            <h3 class="text-sm font-semibold text-voice-secondary mb-6 flex items-center gap-2">
              <Settings2 :size="18" />
              Speech Settings
            </h3>

            <div class="space-y-6">
              <!-- Rate -->
              <div>
                <div class="flex justify-between mb-2">
                  <label for="rate-control" class="text-sm font-medium text-voice-text">
                    Speed
                  </label>
                  <span id="rate-value" class="text-sm text-voice-primary font-medium">
                    {{ store.settings.rate.toFixed(1) }}x
                  </span>
                </div>
                <input
                  id="rate-control"
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  v-model="store.settings.rate"
                  class="voice-slider"
                  aria-labelledby="rate-control"
                  aria-valuetext="Speed: {{ store.settings.rate.toFixed(1) }}x"
                >
              </div>

              <!-- Pitch -->
              <div>
                <div class="flex justify-between mb-2">
                  <label for="pitch-control" class="text-sm font-medium text-voice-text">
                    Pitch
                  </label>
                  <span id="pitch-value" class="text-sm text-voice-primary font-medium">
                    {{ store.settings.pitch.toFixed(1) }}
                  </span>
                </div>
                <input
                  id="pitch-control"
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  v-model="store.settings.pitch"
                  class="voice-slider"
                  aria-labelledby="pitch-control"
                  aria-valuetext="Pitch: {{ store.settings.pitch.toFixed(1) }}"
                >
              </div>

              <!-- Volume -->
              <div>
                <div class="flex justify-between mb-2">
                  <label for="volume-control" class="text-sm font-medium text-voice-text">
                    Volume
                  </label>
                  <span id="volume-value" class="text-sm text-voice-primary font-medium">
                    {{ Math.round(store.settings.volume * 100) }}%
                  </span>
                </div>
                <input
                  id="volume-control"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  v-model="store.settings.volume"
                  class="voice-slider"
                  aria-labelledby="volume-control"
                  aria-valuetext="Volume: {{ Math.round(store.settings.volume * 100) }}%"
                >
              </div>
            </div>
          </div>

          <!-- History -->
          <div class="voice-card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold text-voice-secondary flex items-center gap-2">
                <HistoryIcon :size="18" />
                History
              </h3>
              <button
                v-if="store.history.length > 0"
                @click="store.clearHistory"
                class="text-red-600 hover:underline text-sm"
              >
                Clear
              </button>
            </div>

            <div
              v-if="store.history.length > 0"
              class="space-y-3 max-h-64 overflow-y-auto voice-scrollbar"
            >
              <div
                v-for="h in store.history"
                :key="h.id"
                class="p-3 bg-voice-bg border border-voice-border rounded-lg"
              >
                <p class="text-sm text-voice-text truncate mb-1">{{ h.text }}</p>
                <p class="text-xs text-voice-muted">{{ h.voice }}</p>
              </div>
            </div>

            <div
              v-else
              class="text-center py-8 border-2 border-dashed border-voice-border rounded-lg"
            >
              <HistoryIcon :size="32" :stroke-width="1.5" class="mx-auto mb-2 text-voice-muted opacity-50" />
              <p class="text-sm text-voice-muted">No speech history yet</p>
              <p class="text-xs text-voice-muted mt-1">Your recent speeches will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-voice-border mt-12">
      <div class="max-w-4xl mx-auto px-6 py-8 text-center">
        <p class="text-sm text-voice-muted">
          VoiceFlow — Accessible Text to Speech
        </p>
        <p class="text-xs text-voice-muted mt-2">
          Works entirely in your browser. No data is sent to any server.
        </p>
      </div>
    </footer>

    <!-- <SettingsPanel /> -->
  </div>
</template>
