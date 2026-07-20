export interface AiVoice {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
  provider: "openai" | "elevenlabs" | "google" | "azure" | "polly";
  id: string;
}

export const AI_VOICES: AiVoice[] = [
  // OpenAI
  { voiceURI: "ai:openai:alloy", name: "Alloy (OpenAI)", lang: "en-US", localService: false, default: false, provider: "openai", id: "alloy" },
  { voiceURI: "ai:openai:echo", name: "Echo (OpenAI)", lang: "en-US", localService: false, default: false, provider: "openai", id: "echo" },
  { voiceURI: "ai:openai:fable", name: "Fable (OpenAI)", lang: "en-US", localService: false, default: false, provider: "openai", id: "fable" },
  { voiceURI: "ai:openai:onyx", name: "Onyx (OpenAI)", lang: "en-US", localService: false, default: false, provider: "openai", id: "onyx" },
  { voiceURI: "ai:openai:nova", name: "Nova (OpenAI)", lang: "en-US", localService: false, default: false, provider: "openai", id: "nova" },
  { voiceURI: "ai:openai:shimmer", name: "Shimmer (OpenAI)", lang: "en-US", localService: false, default: false, provider: "openai", id: "shimmer" },

  // ElevenLabs
  { voiceURI: "ai:elevenlabs:Rachel", name: "Rachel (ElevenLabs)", lang: "en-US", localService: false, default: false, provider: "elevenlabs", id: "21m00Tcm4TlvDq8ikWAM" },
  { voiceURI: "ai:elevenlabs:Clyde", name: "Clyde (ElevenLabs)", lang: "en-US", localService: false, default: false, provider: "elevenlabs", id: "2EiwWnXF2V4jOBtiZ0OO" },
  { voiceURI: "ai:elevenlabs:Adam", name: "Adam (ElevenLabs)", lang: "en-US", localService: false, default: false, provider: "elevenlabs", id: "pNInz6obpgq5StwODWNE" },
  { voiceURI: "ai:elevenlabs:Nicole", name: "Nicole (ElevenLabs)", lang: "en-US", localService: false, default: false, provider: "elevenlabs", id: "piTKgcLEGmPEegePnCgY" },

  // Google Cloud TTS
  { voiceURI: "ai:google:en-US-Neural2-C", name: "Neural2 Female (Google)", lang: "en-US", localService: false, default: false, provider: "google", id: "en-US-Neural2-C" },
  { voiceURI: "ai:google:en-US-Neural2-D", name: "Neural2 Male (Google)", lang: "en-US", localService: false, default: false, provider: "google", id: "en-US-Neural2-D" },
  { voiceURI: "ai:google:en-US-Wavenet-D", name: "Wavenet Male (Google)", lang: "en-US", localService: false, default: false, provider: "google", id: "en-US-Wavenet-D" },
  { voiceURI: "ai:google:en-GB-Neural2-B", name: "Neural2 UK Male (Google)", lang: "en-GB", localService: false, default: false, provider: "google", id: "en-GB-Neural2-B" },

  // Azure Speech
  { voiceURI: "ai:azure:en-US-JennyNeural", name: "Jenny (Azure)", lang: "en-US", localService: false, default: false, provider: "azure", id: "en-US-JennyNeural" },
  { voiceURI: "ai:azure:en-US-GuyNeural", name: "Guy (Azure)", lang: "en-US", localService: false, default: false, provider: "azure", id: "en-US-GuyNeural" },
  { voiceURI: "ai:azure:en-GB-SoniaNeural", name: "Sonia UK (Azure)", lang: "en-GB", localService: false, default: false, provider: "azure", id: "en-GB-SoniaNeural" },

  // Amazon Polly
  { voiceURI: "ai:polly:Joanna", name: "Joanna (Polly)", lang: "en-US", localService: false, default: false, provider: "polly", id: "Joanna" },
  { voiceURI: "ai:polly:Matthew", name: "Matthew (Polly)", lang: "en-US", localService: false, default: false, provider: "polly", id: "Matthew" },
  { voiceURI: "ai:polly:Kendra", name: "Kendra (Polly)", lang: "en-US", localService: false, default: false, provider: "polly", id: "Kendra" },
];
