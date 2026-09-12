import type { ScenarioType } from "@/lib/textBank";

export type ScenarioDefinition = {
  key: ScenarioType;
  title: string;
  description: string;
  breathingSubtext: string;
  /** Rough character of the synthesized ambient bed — see useAmbientNoise. */
  ambience: "room-tone" | "hush" | "shuffle" | "studio-hum";
};

export const SCENARIOS: ScenarioDefinition[] = [
  {
    key: "interview",
    title: "Interview",
    description: "Introduce yourself across the table.",
    breathingSubtext: "Let's settle in before you walk into the room.",
    ambience: "room-tone",
  },
  {
    key: "lecture",
    title: "Lecture / Presentation",
    description: "Open a talk to a room that's listening.",
    breathingSubtext: "Let's find steady ground before you take the floor.",
    ambience: "hush",
  },
  {
    key: "classroom",
    title: "Classroom Reading",
    description: "Read aloud in front of the class.",
    breathingSubtext: "Let's breathe together before it's your turn.",
    ambience: "shuffle",
  },
  {
    key: "hosting",
    title: "Hosting a Show",
    description: "Open the show from behind the desk.",
    breathingSubtext: "Let's settle in before the lights come up.",
    ambience: "studio-hum",
  },
];

export function getScenario(key: string) {
  return SCENARIOS.find((s) => s.key === key) ?? SCENARIOS[0];
}
