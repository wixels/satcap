import { useQuery } from '@tanstack/react-query';
import {
  collection,
  DocumentData,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { useEffect } from 'react';
import db from '../../firebase';
import { ILink } from '../../types';

export async function fetchLinkResponses(id: string) {
  const responses: DocumentData[] = [];
  const resSnap = await getDocs(
    collection(
      db,
      `mines/${window.localStorage.getItem('mineId')}/links/${id}/responses`
    )
  );
  resSnap.forEach((doc) => {
    const items = doc.data();
    items.created = items;
    delete items?.consent;
    delete items?.linkDocId;
    delete items?.linkId;
    delete items?.mineDocId;
    delete items?.survey;

    responses.push(items);
  });
  return responses;
}

export async function fetchLinks(force: boolean) {
  const links: ILink[] = [];

  const linksSnap = await getDocs(
    query(
      collection(db, `mines/${window.localStorage.getItem('mineId')}/links`),
      where('deletedAt', '==', null)
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

export const useGetLinks = (force: boolean = false) => {
  return useQuery<ILink[], any>(['links', force], () => fetchLinks(force));
};

export const useGetLinkResponses = (id: string) => {
  return useQuery(['links', id], () => fetchLinkResponses(id), {
    staleTime: 1000 * 60 * 10,
  });
};
