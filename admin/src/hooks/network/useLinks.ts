import { useQuery } from '@tanstack/react-query';
import {
  collection,
  DocumentData,
  getCountFromServer,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import db from '../../firebase';
import { ILink } from '../../types';

export async function fetchLinkResponses(id: string) {
  const responses: DocumentData[] = [];
  const resSnap = await getCountFromServer(
    collection(
      db,
      `mines/${window.localStorage.getItem('mineId')}/links/${id}/responses`
    )
  );
  return resSnap.data().count;
}

export async function fetchLinks(force: boolean) {
  const links: ILink[] = [];

  const linksSnap = await getDocs(
    query(
      collection(db, `mines/${window.localStorage.getItem('mineId')}/links`),
      where('deletedAt', '==', null),
      orderBy('createdAt', 'desc')
    )
  );
  for (const doc of linksSnap.docs) {
    let responses: any = [];
    if (force) {
      responses = await fetchLinkResponses(doc.id);
    }
    links.push({
      ...(doc.data() as ILink),
      docId: doc.id,
      responses,
    });
  }
  return links;
}

export const useGetLinks = () => {
  return useQuery<ILink[]>(['links'], () => fetchLinks(false));
};

export const useGetLinkResponses = () => {
  return useQuery<ILink[]>(['linksResponses'], () => fetchLinks(true), {
    staleTime: 1000 * 60 * 10,
  });
};
