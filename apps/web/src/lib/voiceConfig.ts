export interface VoiceOption {
  id: string;
  label: string;
  description?: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: "data-driven",
    label: "Data-driven",
    description: "Focuses on metrics, performance data, and workout statistics"
  },
  {
    id: "funny-witty",
    label: "Funny and Witty",
    description: "Adds humor and clever wordplay to your activity titles"
  },
  {
    id: "christopher-walken",
    label: "Christopher Walken",
    description: "Titles with distinctive pauses and unexpected emphasis"
  }
];