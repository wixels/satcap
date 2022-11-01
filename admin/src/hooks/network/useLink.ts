import { showNotification } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import db from '../../firebase';
import { ILink } from '../../types';
import { fetchLinkResponses } from './useLinks';

export async function fetchSingleLink(docId: string): Promise<ILink> {
  const docRef = doc(
    db,
    `mines/${window.localStorage.getItem('mineId')}/links`,
    docId
  );
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    showNotification({
      color: 'red',
      message: 'Person not found!',
    });
  }
  const resSnap = await getDocs(
    collection(
      db,
      `mines/${window.localStorage.getItem('mineId')}/links/${docId}/responses`
    )
  );
  let responses: any = [];
  resSnap.forEach((doc) => {
    const items = doc.data();
    delete items?.consent;
    delete items?.linkDocId;
    delete items?.linkId;
    delete items?.mineDocId;

    responses.push(items);
  });

  return {
    ...(docSnap.data() as ILink),
    responses,
  };
}

export const useGetSingleLink = (docId: string) => {
  return useQuery<ILink>(['link', docId], () => fetchSingleLink(docId), {
    staleTime: 1000 * 60 * 10,
  });
};
