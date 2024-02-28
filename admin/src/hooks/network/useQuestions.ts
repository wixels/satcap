import { useQuery } from '@tanstack/react-query';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
} from 'firebase/firestore';
import db from '../../firebase';
import { IQuestion } from '../../types';
import { showNotification } from '@mantine/notifications';

export async function fetchQuestions(surveyKey: string) {
  const questions: IQuestion[] = [];
  const questionsSnap = await getDocs(
    query(
      collection(db, 'questions'),
      where('surveyKey', '==', surveyKey),
      orderBy('order')
    )
  );
  questionsSnap.forEach((doc) => {
    questions.push({
      ...(doc.data() as IQuestion),
      id: doc.id,
    });
  });
  return questions;
}
export async function fetchQuestion(questionId: string) {
  const docRef = doc(db, 'questions', questionId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    showNotification({
      color: 'red',
      message: 'Question not found!',
    });
  }
  return docSnap.data() as IQuestion;
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
export const useGetQuestion = (questionId: string) => {
  return useQuery<IQuestion, any>(
    ['question', questionId],
    () => fetchQuestion(questionId),
    {
      staleTime: 1000 * 60 * 10,
    }
  );
};
