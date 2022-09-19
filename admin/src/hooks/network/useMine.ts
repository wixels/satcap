import { showNotification } from '@mantine/notifications';
import { IconX } from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import { signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import db, { auth } from '../../firebase';
import { IMine, IPackage, IUser } from '../../types';

const fetchMine = async (): Promise<IMine | void> => {
  // @ts-ignore
  const docRef = doc(db, 'mines', window.localStorage.getItem('mineId'));
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      ...(docSnap.data() as IMine),
      mineId: docSnap.id,
    };
  } else {
    signOut(auth);
    showNotification({
      color: 'red',
      message: 'Unable to find the mine your associated to',
    });
  }
};
const fetchPackages = async (packUids: Array<string>): Promise<IPackage[]> => {
  const data: IPackage[] = [];
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'packages'), where('packageId', 'in', packUids))
    );
    querySnapshot.forEach((doc) => {
      data.push({
        ...(doc.data() as IPackage),
        packageDocId: doc.id,
      });
    });
  } catch (error: any) {
    showNotification({
      color: 'red',
      message: error?.message || 'Unable to find your packages',
    });
  }

  return data;
};

export const fetchMineWithPacks = async () => {
  const mine = await fetchMine();
  // @ts-ignore
  const packs = await fetchPackages(mine?.packages);

  const scopes = new Set();
  packs.forEach((pack) => {
    pack.scopes?.forEach((scope) => {
      scopes.add(scope);
    });
  });
  const stringedScopes: string[] | any = Array.from(scopes);

  // @ts-ignore
  return {
    ...mine,
    packages: packs,
    scopes: stringedScopes,
  };
};

export const useGetMine = () => {
  // @ts-ignore
  return useQuery<IMine>(['mine'], fetchMineWithPacks);
};
