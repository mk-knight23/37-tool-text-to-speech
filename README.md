# VoiceFlow — Text to Speech

An accessible text-to-speech application with a minimal, focus-oriented interface. Built with Vue 3 and the browser's native Speech Synthesis API.

---

## What It Does

VoiceFlow converts written text into spoken words using your browser's built-in speech synthesis. The interface is designed with accessibility as a top priority, featuring large touch targets, high contrast, and clear focus indicators.

**When to use this tool:**
- Converting articles or documents to audio for listening
- Accessibility assistance for users with visual impairments
- Language learning and pronunciation practice
- Proofreading by listening to written content

---

## Inputs

| Input | Type | Range | Description |
|-------|------|-------|-------------|
| Text | Textarea | Any length | Content to convert to speech |
| Voice | Select | Browser-dependent | Select from available system voices |
| Speed | Slider | 0.5x - 2.0x | Speech rate control |
| Pitch | Slider | 0.5 - 2.0 | Voice pitch control |
| Volume | Slider | 0% - 100% | Output volume |

---

## Outputs

| Output | Type | Description |
|--------|------|-------------|
| Audio | Speech | Browser synthesized speech output |
| Visual | Animation | Waveform visualization during playback |
| Status | Text | Screen reader announcements |

---

## Workflow Steps

1. **Enter Text** — Type or paste content into the text area
2. **Select Voice** — Choose from available system voices
3. **Adjust Settings** — Set speed, pitch, and volume as needed
4. **Play** — Click Speak button or use keyboard shortcut
5. **Control** — Pause or stop playback as needed

---

## Stack Choice Rationale

| Technology | Purpose |
|------------|---------|
| Vue 3 (Composition API) | Reactive state with minimal boilerplate |
| TypeScript | Type safety for speech settings |
| Vite | Fast development server and builds |
| Tailwind CSS | Utility styling with custom a11y classes |
| Pinia | State persistence for settings and history |
| Web Speech API | Native browser speech synthesis |

---

## Accessibility Features

- **Large Typography**: 18px base font size for readability
- **High Contrast**: WCAG AAA compliant color ratios
- **Touch Targets**: Minimum 48px for all interactive elements
- **Focus Indicators**: Clear 3px outline on all focusable elements
- **Skip Links**: Skip to main content for keyboard users
- **ARIA Labels**: Comprehensive labeling for screen readers
- **Live Regions**: Status announcements for dynamic content
- **Keyboard Navigation**: Full functionality via keyboard
- **Reduced Motion**: Respects user motion preferences

---

## Setup Steps

```bash
# Clone the repository
git clone https://github.com/mk-knight23/50-Text-To-Speech-Web-App.git
cd 50-Text-To-Speech-Web-App

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Keyboard Controls

| Key | Action |
|-----|--------|
| Tab | Navigate between controls |
| Space/Enter | Activate focused button |
| Escape | Stop speech |

---

## Limitations

- **Browser Support**: Requires Speech Synthesis API support (all modern browsers)
- **Voice Availability**: Depends on installed system voices
- **No Audio Export**: Cannot save speech as audio file
- **Character Limit**: Some browsers limit text length per utterance
- **Quality**: Voice quality varies by browser and system

---

## Project Structure

```
37-tool-text-to-speech/
├── design-system/
│   └── MASTER.md              # Minimal Voice UI theme specification
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── SettingsPanel.vue  # Theme and settings modal
│   ├── composables/
│   │   └── useAudio.ts         # Sound effects
│   ├── stores/
│   │   ├── ttsStore.ts         # Speech state and history
│   │   ├── settings.ts         # User preferences
│   │   └── stats.ts            # Usage statistics
│   ├── App.vue                 # Main application
│   ├── main.ts                 # Entry point
│   └── style.css               # Accessible theme styles
├── package.json
├── tailwind.config.js
└── README.md
```

---

## Design System

This application follows a **Minimal Voice / Accessibility-First** design theme:
- 18px minimum font size
- High contrast colors (WCAG AAA)
- 48px minimum touch targets
- Large sliders with visible handles
- Calm, focused interface
- Screen reader optimized

See `design-system/MASTER.md` for complete accessibility specifications.

---

## Privacy

- All processing happens **locally in your browser**
- No text is sent to any server
- History stored locally in your browser
- No cookies or tracking

---

## Deployment

This project is configured for deployment on three platforms:

### GitHub Pages
- **Workflow**: `.github/workflows/deploy.yml`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Trigger**: Push to `main` branch
- **Action**: `actions/deploy-page@v4` with Vite static site generator

### Vercel
- **Config**: `vercel.json`
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Rewrites**: SPA fallback to `/index.html`

### Netlify
- **Config**: `netlify.toml`
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Redirects**: All paths to `/index.html` (SPA support)

---

## Live Links

| Platform | URL |
|----------|-----|
| **GitHub Pages** | https://mk-knight23.github.io/37-tool-text-to-speech/ |
| **Vercel** | https://37-tool-text-to-speech.vercel.app/ |
| **Netlify** | https://37-tool-text-to-speech.netlify.app/ |

---

## License

MIT License — see [LICENSE](LICENSE) for details.
