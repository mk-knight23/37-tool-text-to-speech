import { ref, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useStatsStore } from '../stores/stats'
import { KEYBOARD_SHORTCUTS } from '../utils/constants'

export type KeyboardAction = 'playPause' | 'stop' | 'toggleTheme' | 'toggleHelp' | 'toggleSettings' | 'none'

export function useKeyboardControls() {
  const settingsStore = useSettingsStore()
  const statsStore = useStatsStore()
  const lastAction = ref<KeyboardAction>('none')

  const modifiers = {
    ctrl: false,
    meta: false,
    shift: false,
    alt: false
  }

  function handleKeyDown(event: KeyboardEvent) {
    modifiers.ctrl = event.ctrlKey
    modifiers.meta = event.metaKey
    modifiers.shift = event.shiftKey
    modifiers.alt = event.altKey

    const action = parseShortcut(event)
    if (action !== 'none') {
      event.preventDefault()
      executeAction(action)
    }
  }

  function handleKeyUp(event: KeyboardEvent) {
    modifiers.ctrl = event.ctrlKey
    modifiers.meta = event.metaKey
    modifiers.shift = event.shiftKey
    modifiers.alt = event.altKey
  }

  function parseShortcut(event: KeyboardEvent): KeyboardAction {
    const key = event.key.toLowerCase()

    if (KEYBOARD_SHORTCUTS.PLAY_PAUSE.includes(key) && !modifiers.ctrl && !modifiers.meta) {
      return 'playPause'
    }

    if (KEYBOARD_SHORTCUTS.STOP.includes(key)) {
      return 'stop'
    }

    if (KEYBOARD_SHORTCUTS.TOGGLE_THEME.some(shortcut => matchesShortcut(shortcut, event))) {
      return 'toggleTheme'
    }

    if (KEYBOARD_SHORTCUTS.TOGGLE_HELP.some(shortcut => matchesShortcut(shortcut, event))) {
      return 'toggleHelp'
    }

    if (KEYBOARD_SHORTCUTS.TOGGLE_SETTINGS.some(shortcut => matchesShortcut(shortcut, event))) {
      return 'toggleSettings'
    }

    return 'none'
  }

  function matchesShortcut(shortcut: string, event: KeyboardEvent): boolean {
    const parts = shortcut.split('+')
    const expectedMods = parts.slice(0, -1)
    const expectedKey = parts[parts.length - 1]?.toLowerCase() || ''

    const hasCtrl = expectedMods.includes('ctrl') ? event.ctrlKey : !event.ctrlKey
    const hasMeta = expectedMods.includes('meta') ? event.metaKey : !event.metaKey

    return hasCtrl && hasMeta && event.key.toLowerCase() === expectedKey
  }

  function executeAction(action: KeyboardAction) {
    lastAction.value = action
    statsStore.recordKeyboardShortcut()

    switch (action) {
      case 'toggleTheme':
        settingsStore.toggleTheme()
        statsStore.recordThemeSwitch()
        break
      case 'toggleHelp':
        settingsStore.toggleHelp()
        statsStore.recordSettingsOpen()
        break
      case 'toggleSettings':
        settingsStore.toggleHelp()
        statsStore.recordSettingsOpen()
        break
      case 'stop':
        window.speechSynthesis.cancel()
        break
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  })

  return {
    lastAction
  }
}
