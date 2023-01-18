import { useQuery } from '@tanstack/react-query';
import { collectionGroup, getDocs, query, where } from 'firebase/firestore';
import db from '../../firebase';

export async function fetchResponses(key: string) {
  const responses: any[] = [];

  let q;

  if (key === 'wp-three-one') {
    const keys = [
      'wp-three-one-pre',
      'wp-three-one-post',
      'wp-three-one-post-response',
    ];
    q = query(collectionGroup(db, 'responses'), where('survey', 'in', keys));
  } else {
    q = query(collectionGroup(db, 'responses'), where('survey', '==', key));
  }
  const responsesSnap = await getDocs(q);
  responsesSnap.forEach((doc) => {
    responses.push({
      ...(doc.data() as any),
      id: doc.id,
    });
  });
  return responses;
}

export const useGetResponses = (key: string) => {
  return useQuery<any>(['responses', key], () => fetchResponses(key), {
    staleTime: 1000 * 60 * 10,
  });
};
