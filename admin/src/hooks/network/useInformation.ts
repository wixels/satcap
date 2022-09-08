import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
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
      type: 'notice',
    });
  });
  resourceSnap.forEach((doc) => {
    information.push({
      ...(doc.data() as IResource),
      type: 'resource',
    });
  });
  return information;
}

export const useGetInformation = () => {
  return useQuery<Array<IResource | INotice>>(
    ['information'],
    fetchInformation
  );
};
