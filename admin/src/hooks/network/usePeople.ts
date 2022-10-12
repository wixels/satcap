import { showNotification } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
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
  return useQuery<IUser[], any>(['people'], fetchPeople, {
    staleTime: 1000 * 60 * 10,
  });
};

export async function fetchPerson(id: string): Promise<IUser> {
  const docRef = doc(
    db,
    `mines/${window.localStorage.getItem('mineId')}/users`,
    id
  );
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    showNotification({
      color: 'red',
      message: 'Person not found!',
    });
  }
  return docSnap.data() as IUser;
}

export const useGetPerson = (id: string) => {
  return useQuery(['people', id], () => fetchPerson(id), {
    staleTime: 1000 * 60 * 10,
  });
};
