import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect } from 'react';
import db from '../../firebase';
import { ILink } from '../../types';

export async function fetchLinks() {
  const links: ILink[] = [];
  const linksSnap = await getDocs(
    collection(db, `mines/${window.localStorage.getItem('mineId')}/links`)
  );
  linksSnap.forEach((doc) => {
    links.push({
      ...(doc.data() as ILink),
      docId: doc.id,
    });
  });
  return links;
}

export const useGetLinks = () => {
  return useQuery<ILink[], any>(['links'], fetchLinks);
};
