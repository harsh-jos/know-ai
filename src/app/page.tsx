import { PersonalReader } from "@/components/PersonalReader";
import knowledgeBase from "@/data/knowledge-base.json";

export default function Home() {
  return <PersonalReader items={knowledgeBase} />;
}
