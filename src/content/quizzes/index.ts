import { QUIZ_MISSION_01 } from '@/content/quizzes/mission-01';
import { QUIZ_MISSION_02 } from '@/content/quizzes/mission-02';
import { QUIZ_MISSION_03 } from '@/content/quizzes/mission-03';
import { QUIZ_MISSION_04 } from '@/content/quizzes/mission-04';
import { QUIZ_MISSION_05 } from '@/content/quizzes/mission-05';
import { QUIZ_MISSION_06 } from '@/content/quizzes/mission-06';
import { QUIZ_MISSION_07 } from '@/content/quizzes/mission-07';
import { QUIZ_MISSION_08 } from '@/content/quizzes/mission-08';
import { QUIZ_MISSION_10 } from '@/content/quizzes/mission-10';
import { QUIZ_MISSION_11 } from '@/content/quizzes/mission-11';
import { QUIZ_MISSION_12 } from '@/content/quizzes/mission-12';
import { QUIZ_MISSION_13 } from '@/content/quizzes/mission-13';
import { QUIZ_MISSION_14 } from '@/content/quizzes/mission-14';
import type { Quiz } from '@/types/quiz';

export { QUIZ_MISSION_01 } from '@/content/quizzes/mission-01';
export { QUIZ_MISSION_02 } from '@/content/quizzes/mission-02';
export { QUIZ_MISSION_03 } from '@/content/quizzes/mission-03';
export { QUIZ_MISSION_04 } from '@/content/quizzes/mission-04';
export { QUIZ_MISSION_05 } from '@/content/quizzes/mission-05';
export { QUIZ_MISSION_06 } from '@/content/quizzes/mission-06';
export { QUIZ_MISSION_07 } from '@/content/quizzes/mission-07';
export { QUIZ_MISSION_08 } from '@/content/quizzes/mission-08';
export { QUIZ_MISSION_10 } from '@/content/quizzes/mission-10';
export { QUIZ_MISSION_11 } from '@/content/quizzes/mission-11';
export { QUIZ_MISSION_12 } from '@/content/quizzes/mission-12';
export { QUIZ_MISSION_13 } from '@/content/quizzes/mission-13';
export { QUIZ_MISSION_14 } from '@/content/quizzes/mission-14';

const BY_ID: Record<string, Quiz> = {
  [QUIZ_MISSION_01.id]: QUIZ_MISSION_01,
  [QUIZ_MISSION_02.id]: QUIZ_MISSION_02,
  [QUIZ_MISSION_03.id]: QUIZ_MISSION_03,
  [QUIZ_MISSION_04.id]: QUIZ_MISSION_04,
  [QUIZ_MISSION_05.id]: QUIZ_MISSION_05,
  [QUIZ_MISSION_06.id]: QUIZ_MISSION_06,
  [QUIZ_MISSION_07.id]: QUIZ_MISSION_07,
  [QUIZ_MISSION_08.id]: QUIZ_MISSION_08,
  [QUIZ_MISSION_10.id]: QUIZ_MISSION_10,
  [QUIZ_MISSION_11.id]: QUIZ_MISSION_11,
  [QUIZ_MISSION_12.id]: QUIZ_MISSION_12,
  [QUIZ_MISSION_13.id]: QUIZ_MISSION_13,
  [QUIZ_MISSION_14.id]: QUIZ_MISSION_14,
};

export function getQuizById(id: string): Quiz | undefined {
  return BY_ID[id];
}
