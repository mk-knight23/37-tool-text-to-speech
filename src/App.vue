<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTtsStore } from './stores/ttsStore'
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Download, 
  History as HistoryIcon, 
  Settings2, 
  Mic2,
  Languages,
  Activity,
  Github
} from 'lucide-vue-next'

const store = useTtsStore()
const text = ref('Hello, welcome to Culinara AI Voice Studio. Enter your text here to begin synthesis.')
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
  loadVoices()
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices
  }
})

const speak = () => {
  if (isSpeaking.value) synth.cancel()
  if (!text.value) return

  const utterance = new SpeechSynthesisUtterance(text.value)
  if (selectedVoice.value) utterance.voice = selectedVoice.value
  utterance.pitch = store.settings.pitch
  utterance.rate = store.settings.rate
  utterance.volume = store.settings.volume

  utterance.onstart = () => isSpeaking.value = true
  utterance.onend = () => isSpeaking.value = false
  utterance.onerror = () => isSpeaking.value = false

  synth.speak(utterance)
  store.addToHistory(text.value, selectedVoice.value?.name || 'Default')
}

const stop = () => {
  synth.cancel()
  isSpeaking.value = false
}
</script>

<template>
  <div class="min-h-screen bg-audio-dark">
    <!-- Navigation -->
    <nav class="p-8 flex justify-between items-center">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-audio-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-audio-primary/20">
          <Activity :size="24" />
        </div>
        <h1 class="text-xl font-display font-black tracking-tight uppercase uppercase">Studio<span class="text-audio-primary italic font-light">Voice</span></h1>
      </div>
      <div class="flex items-center space-x-6 text-slate-500">
        <a href="https://github.com/mk-knight23/50-Text-To-Speech-Web-App" target="_blank"><Github class="hover:text-white transition-colors" :size="20" /></a>
      </div>
    </nav>

    <main class="max-w-6xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 pt-10 pb-40">
      
      <!-- Editor Section -->
      <div class="lg:col-span-8 space-y-8">
        <div class="space-y-4">
           <h2 class="text-4xl font-display font-black tracking-tighter uppercase">Synthesis <span class="text-audio-primary italic font-light">Engine</span></h2>
           <p class="text-slate-500 font-medium italic">High-fidelity text-to-speech generation with real-time controls.</p>
        </div>

        <div class="relative group">
          <textarea 
            v-model="text"
            class="w-full h-80 bg-slate-900 border-2 border-white/5 rounded-[2.5rem] p-10 text-xl font-medium outline-none focus:border-audio-primary/30 transition-all custom-scrollbar resize-none shadow-2xl"
            placeholder="Type or paste your content here..."
          ></textarea>
          <div class="absolute bottom-6 right-10 text-[10px] font-black uppercase tracking-widest text-slate-600">
            {{ text.length }} Characters
          </div>
        </div>

        <!-- Playback Bar -->
        <div class="glass p-6 rounded-[2rem] flex items-center justify-between shadow-xl">
           <div class="flex items-center space-x-4">
              <button 
                @click="speak"
                class="w-16 h-16 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-lg"
                :class="isSpeaking ? 'bg-audio-accent text-white shadow-audio-accent/20' : 'bg-audio-primary text-white shadow-audio-primary/20'"
              >
                <Pause v-if="isSpeaking" fill="currentColor" :size="24" />
                <Play v-else fill="currentColor" :size="24" class="ml-1" />
              </button>
              <button @click="stop" class="p-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                <Square fill="currentColor" :size="18" />
              </button>
           </div>

           <!-- Audio Visualizer Mock -->
           <div class="flex-1 px-10 flex items-center justify-center space-x-1.5 h-10 overflow-hidden opacity-30 group" :class="{ 'opacity-100': isSpeaking }">
              <div v-for="i in 20" :key="i" class="bar" :style="{ animationDelay: `${i * 0.1}s` }"></div>
           </div>

           <button class="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-audio-primary hover:text-white transition-all shadow-xl flex items-center">
              <Download class="mr-2" :size="14" /> Export WAV
           </button>
        </div>
      </div>

      <!-- Settings Sidebar -->
      <div class="lg:col-span-4 space-y-10">
        
        <div class="audio-card p-8 space-y-8">
           <div class="flex items-center justify-between">
              <h3 class="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center"><Settings2 class="mr-2 text-audio-primary" :size="14" /> Modulators</h3>
              <button @click="loadVoices" class="text-slate-500 hover:text-white"><RotateCcw :size="14" /></button>
           </div>

           <div class="space-y-6">
              <div class="space-y-3">
                 <div class="flex justify-between text-[10px] font-black uppercase text-slate-500">
                    <span>Pitch</span>
                    <span>{{ store.settings.pitch.toFixed(1) }}</span>
                 </div>
                 <input type="range" min="0.5" max="2" step="0.1" v-model="store.settings.pitch" class="control-slider">
              </div>
              <div class="space-y-3">
                 <div class="flex justify-between text-[10px] font-black uppercase text-slate-500">
                    <span>Rate</span>
                    <span>{{ store.settings.rate.toFixed(1) }}</span>
                 </div>
                 <input type="range" min="0.5" max="2" step="0.1" v-model="store.settings.rate" class="control-slider">
              </div>
              <div class="space-y-3">
                 <div class="flex justify-between text-[10px] font-black uppercase text-slate-500">
                    <span>Volume</span>
                    <span>{{ Math.round(store.settings.volume * 100) }}%</span>
                 </div>
                 <input type="range" min="0" max="1" step="0.1" v-model="store.settings.volume" class="control-slider">
              </div>
           </div>
        </div>

        <div class="audio-card p-8 space-y-6">
           <h3 class="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center"><Languages class="mr-2 text-audio-primary" :size="14" /> Neural Voice</h3>
           <select 
             v-model="selectedVoice"
             class="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-audio-primary transition-all custom-scrollbar"
           >
              <option v-for="voice in voices" :key="voice.name" :value="voice">
                {{ voice.name }} ({{ voice.lang }})
              </option>
           </select>
           <p class="text-[10px] text-slate-500 font-medium italic">Detected {{ voices.length }} high-fidelity voices on this system.</p>
        </div>

        <div class="audio-card p-8 space-y-6">
           <div class="flex items-center justify-between">
              <h3 class="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center"><HistoryIcon class="mr-2 text-audio-primary" :size="14" /> History</h3>
              <button @click="store.clearHistory" class="text-red-500 hover:underline text-[8px] font-black uppercase">Purge</button>
           </div>
           <div class="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              <div v-for="h in store.history" :key="h.id" class="p-3 bg-white/5 rounded-xl space-y-1 group">
                 <p class="text-[10px] font-bold truncate">{{ h.text }}</p>
                 <div class="flex justify-between items-center">
                    <span class="text-[8px] font-black uppercase text-slate-600 tracking-tighter">{{ h.voice }}</span>
                    <button class="opacity-0 group-hover:opacity-100 text-audio-primary transition-opacity"><Play :size="10" /></button>
                 </div>
              </div>
              <div v-if="store.history.length === 0" class="text-center py-6">
                <Mic2 class="mx-auto text-slate-800 mb-2" :size="24" />
                <p class="text-[8px] font-black uppercase text-slate-600 tracking-[0.2em]">Archive Empty</p>
              </div>
           </div>
        </div>

      </div>

    </main>

    <footer class="py-12 border-t border-white/5 flex flex-col items-center space-y-4">
       <p class="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">Synthesized in 2026. Staff Engineer Architect.</p>
    </footer>

  </div>
</template>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-white/10 rounded-full;
}
</style>
