export type GameId =
  | 'memory_match'
  | 'pattern_recall'
  | 'number_sequence'
  | 'adaptive_chess'
  | 'focus_flight'
  | 'object_association'
  | 'ner_memory_quiz';

export type Game = {
  id: GameId;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
};

export const games: Game[] = [
  {
    id: 'memory_match',
    title: 'Memory Match',
    description: 'Test your visual memory.',
    difficulty: 'Easy',
  },
  {
    id: 'pattern_recall',
    title: 'Pattern Recall',
    description: 'Remember and reproduce patterns.',
    difficulty: 'Medium',
  },
  {
    id: 'number_sequence',
    title: 'Number Sequence',
    description: 'Challenge your number memory.',
    difficulty: 'Medium',
  },
  {
    id: 'adaptive_chess',
    title: 'Adaptive Chess',
    description: 'Exercise planning and problem solving.',
    difficulty: 'Hard',
  },
  {
    id: 'focus_flight',
    title: 'Prakrti Spotter',
    description: 'Train attention and focus.',
    difficulty: 'Medium',
  },
  {
    id: 'object_association',
    title: 'Object Association',
    description: 'Strengthen object and memory associations.',
    difficulty: 'Easy',
  },
  {
    id: 'ner_memory_quiz',
    title: 'NER Memory Quiz',
    description: 'Challenge your recognition and memory.',
    difficulty: 'Medium',
  },
];