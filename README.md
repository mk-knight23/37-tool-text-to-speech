# 37-tool-text-to-speech

# VoiceFlow — Text to Speech

A production-grade, accessible Text-to-Speech utility built with Vue 3 and the native Web Speech API.

![VoiceFlow Banner](https://images.unsplash.com/photo-1589149021021-030f9a2e1d0c?auto=format&fit=crop&w=1200&q=80)

## 🚀 Features

- **Local Processing**: Speech synthesis happens entirely in your browser. No data is sent to external servers.
- **Multi-Voice Support**: Access all high-quality voices available on your OS and browser.
- **Dynamic Controls**: Fine-tune pitch, rate, and volume for the perfect speaking voice.
- **Fault Tolerant**: Global error boundaries and input validation ensure a crash-free experience.
- **Rich UI**: Dark mode support, wave animations, and mobile-responsive layout.
- **Notifications**: Real-time status updates via `vue-sonner` toast notifications.
- **Accessible**: Built with a focus on keyboard navigation and screen reader support (ARIA-compliant).

## 🛠️ Tech Stack

- **Framework**: Vue 3 (Composition API).
- **State**: Pinia (with persistent state).
- **Routing**: Vue Router.
- **Styling**: Tailwind CSS v3.
- **Icons**: Lucide Vue Next.
- **Notifications**: Vue Sonner.
- **Build**: Vite + TypeScript.

## 📦 Setup & Installation

```bash
git clone <repo-url>
cd 37-tool-text-to-speech
npm install
npm run dev
```

## 📐 Architecture

- **Composables**: Centralized audio logic in `useAudio` and Speech API handling.
- **Stores**: Persistent user settings and speech history managed via Pinia.
- **Views**: Clean separation between Home, History, Favorites, and Settings.

## 🚀 Deployment

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mk-knight23/37-tool-text-to-speech)

1. Push to GitHub
2. Import to Vercel
3. Deploy

### Netlify

[![Netlify Deploy](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/mk-knight23/37-tool-text-to-speech)

1. Push to GitHub
2. Import to Netlify
3. Deploy

### Local Build

```bash
npm run build
npm run preview
```

## 📁 Environment Variables

Create a `.env` file:

```env
VITE_ANALYTICS_ENABLED=false
VITE_DEFAULT_RATE=1
VITE_DEFAULT_PITCH=1
VITE_DEFAULT_VOLUME=1
```

## 🖼️ Screenshots

### Main Interface
![Main Interface](https://images.unsplash.com/photo-1589149021021-030f9a2e1d0c?auto=format&fit=crop&w=800&q=80)

### Voice Selection
![Voice Selection](https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80)

### Settings Panel
![Settings Panel](https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=800&q=80)

## 🤝 Roadmap

- [ ] Export audio to MP3/WAV.
- [ ] Multi-language UI support.
- [ ] Integration with cloud TTS providers (optional).

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

Made by [Musharraf Kazi](https://github.com/mk-knight23)


## ✨ Features

This repository has been upgraded with the following features:

1. **Add Vue 3 Composition API** ✅
2. **Implement Pinia for state** ✅
3. **Add Vue Router guards** ✅
4. **Create composables** ✅
5. **Add Teleport and Suspense** ✅
6. **Implement v-model optimization** ✅
7. **Add TypeScript support** ✅
8. **Create reusable components** ✅
9. **Add transitions and animations** ✅
10. **Implement Vitest tests** ✅

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📦 Tech Stack

- Modern web framework
- Optimized for performance
- Responsive design
- Accessibility ready

## 🛠️ Installation

```bash
git clone https://github.com/mk-knight23/37-tool-text-to-speech.git
cd 37-tool-text-to-speech
npm install
```

## 📝 License

MIT

---

*Last updated: 2026-02-25*
