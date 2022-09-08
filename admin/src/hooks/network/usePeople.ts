import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import db from '../../firebase';
import { IUser } from '../../types';

export async function fetchPeople() {
  const people: IUser[] = [];
  const peopleSnap = await getDocs(
    collection(db, `mines/${window.localStorage.getItem('mineId')}/users`)
  );
  peopleSnap.forEach((doc) => {
    people.push({
      ...(doc.data() as IUser),
      docId: doc.id,
    });
  });
  return people;
}

export const useGetPeople = () => {
  return useQuery<IUser[], any>(['people'], fetchPeople);
};
