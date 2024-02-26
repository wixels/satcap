import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import db from '../../firebase';
import { IQuestion } from '../../types';

export async function fetchQuestions(surveyKey: string) {
  const questions: IQuestion[] = [];
  const questionsSnap = await getDocs(
    query(collection(db, 'questions'), where('surveyKey', '==', surveyKey), orderBy('order'))
  );
  questionsSnap.forEach((doc) => {
    questions.push({
      ...(doc.data() as IQuestion),
      id: doc.id,
    });
  });
  return questions;
}

export const useGetQuestions = (surveyKey: string) => {
  return useQuery<IQuestion[], any>(
    ['questions', surveyKey],
    () => fetchQuestions(surveyKey),
    {
      staleTime: 1000 * 60 * 10,
    }
  );
};
