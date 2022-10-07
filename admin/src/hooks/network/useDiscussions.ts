import { showNotification } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { useEffect } from 'react';
import db from '../../firebase';
import { IDiscussion, ILink, INotice, IResource } from '../../types';

export async function fetchDiscussions() {
  const discussions: IDiscussion[] = [];

  const q = query(
    collection(db, `mines/${window.localStorage.getItem('mineId')}/queries`),
    where('mineDocId', '==', window.localStorage.getItem('mineId'))
  );

  const discSnap = await getDocs(q);
  discSnap.forEach((doc) => {
    discussions.push({
      ...(doc.data() as IDiscussion),
      docId: doc.id,
    });
  });
  return discussions;
}

export const useGetDiscussions = () => {
  return useQuery<IDiscussion[], any>(['discussions'], fetchDiscussions, {
    staleTime: 1000 * 60 * 10,
  });
};

export async function fetchSingleDiscussion(id: string) {
  const docRef = doc(
    db,
    `mines/${window.localStorage.getItem('mineId')}/queries`,
    id
  );
  const docSnap = await getDoc(docRef);

  return docSnap.exists()
    ? docSnap.data()
    : showNotification({
        color: 'red',
        message: 'Query Submission not found!',
      });
}

export const useGetSingleDiscussion = (id: string) => {
  return useQuery<IDiscussion>(
    ['discussions', id],
    // @ts-ignore
    () => fetchSingleDiscussion(id),
    { staleTime: 1000 * 60 * 10 }
  );
};
