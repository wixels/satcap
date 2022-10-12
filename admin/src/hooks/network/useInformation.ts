import { showNotification } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useEffect } from 'react';
import db from '../../firebase';
import { ILink, INotice, IResource } from '../../types';

export async function fetchInformation() {
  const information: Array<IResource | INotice> = [];
  const noticeSnap = await getDocs(
    collection(db, `mines/${window.localStorage.getItem('mineId')}/notices`)
  );
  const resourceSnap = await getDocs(
    collection(db, `mines/${window.localStorage.getItem('mineId')}/resources`)
  );
  noticeSnap.forEach((doc) => {
    information.push({
      ...(doc.data() as INotice),
      docId: doc.id,
      type: 'notice',
    });
  });
  resourceSnap.forEach((doc) => {
    information.push({
      ...(doc.data() as IResource),
      docId: doc.id,
      type: 'resource',
    });
  });
  return information;
}

export const useGetInformation = () => {
  return useQuery<Array<IResource | INotice>>(
    ['information'],
    fetchInformation,
    {
      staleTime: 1000 * 60 * 10,
    }
  );
};

export async function fetchSingleInfo(
  type: 'resources' | 'notices',
  id: string
) {
  const docRef = doc(
    db,
    `mines/${window.localStorage.getItem('mineId')}/${type}`,
    id
  );
  const docSnap = await getDoc(docRef);
  return docSnap.exists()
    ? { ...docSnap.data(), type, docId: docSnap.id }
    : showNotification({
        color: 'red',
        message: `${type}not found!`,
      });
}

export const useGetSingleInformation = (
  type: 'resources' | 'notices',
  id: string
) => {
  return useQuery<INotice | IResource>(
    ['information', type, id],
    () =>
      // @ts-ignore
      fetchSingleInfo(type, id),
    { staleTime: 1000 * 60 * 10 }
  );
};
