import { useLocalStorage } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { IconX } from '@tabler/icons';
import { useNavigate } from '@tanstack/react-location';
import { getAuth, signOut } from 'firebase/auth';
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import db, { auth } from '../firebase';
import useAuthState from '../hooks/useAuthState';
import { IMine, IPackage, IUser } from '../types';

const AuthenticationContext = createContext({});

function AuthenticationProvider({ children }: any) {
  const [user, loading, error] = useAuthState(getAuth());

  const naviagte = useNavigate();
  useEffect(() => {
    if (error != null || (user == null && !loading)) {
      naviagte({ to: '/auth/login' });
    }
  }, [user, loading, error]);

  return (
    <AuthenticationContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthenticationContext.Provider>
  );
}

function useGetUser() {
  const [fetching, setFetching] = useState(true);
  // @ts-ignore
  const { user: cred, loading, error } = useContext(AuthenticationContext);
  const [dbUser, setDbUser] = useState<IUser | null>(null);
  const naviagte = useNavigate();

  useEffect(() => {
    let unsubscribe;

    if (cred != null && !loading && error == null) {
      const q = query(
        collectionGroup(db, 'users'),
        where('authUid', '==', cred.uid)
      );
      setFetching(true);
      unsubscribe = onSnapshot(
        q,
        (doc) => {
          doc.forEach((doc) => {
            setDbUser({
              ...(doc.data() as IUser),
              mineId: doc.data().mineId || doc.ref.parent.parent?.id || null,
              docId: doc.id,
            });
            // @ts-ignore
            window.localStorage.setItem(
              'mineId',
              doc.data().mineId || doc?.ref?.parent?.parent?.id
            );
          });
          setFetching(false);
        },
        (error) => {
          showNotification({
            icon: <IconX size={18} />,
            color: 'red',
            message:
              error.message ||
              'Unable to find the account with the provided credentials',
          });
          window.localStorage.clear();
          setFetching(false);
          naviagte({ to: '/auth/login' });
        }
      );
    }
    return unsubscribe;
  }, [cred]);

  return { user: dbUser, fetching };
  // return { user: dbUser, cred, loading, fetching, error };
}
function userGetMine() {
  const [fetching, setFetching] = useState(true);
  const [mine, setMine] = useState<IMine>();
  const userCtx = useGetUser();

  const fetchMine = async (): Promise<IMine | void> => {
    // @ts-ignore
    const docRef = doc(db, 'mines', userCtx?.user?.mineId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        ...(docSnap.data() as IMine),
        mineId: docSnap.id,
      };
    } else {
      signOut(auth);
      window.localStorage.clear();
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        message: 'Unable to find the mine your associated to',
      });
    }
  };
  const fetchPackages = async (
    packUids: Array<string>
  ): Promise<IPackage[]> => {
    const data: IPackage[] = [];
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'packages'), where('docId', 'in', packUids))
      );
      querySnapshot.forEach((doc) => {
        data.push({
          ...(doc.data() as IPackage),
          packageDocId: doc.id,
        });
      });
    } catch (error: any) {
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        message: error?.message || 'Unable to find your packages',
      });
    }

    return data;
  };

  useEffect(() => {
    if (!userCtx.fetching && userCtx.user) {
      (async () => {
        setFetching(true);
        try {
          const mine = await fetchMine();
          // @ts-ignore
          const packs = await fetchPackages(mine?.packages);

          const scopes = new Set();
          packs.forEach((pack) => {
            pack.scopes?.forEach((scope) => {
              scopes.add(scope);
            });
          });

          // @ts-ignore
          setMine({
            ...mine,
            packages: packs,
            // @ts-ignore
            scopes: Array.from(scopes),
          });
          setFetching(false);
        } catch {
          showNotification({
            icon: <IconX size={18} />,
            color: 'red',
            message: 'Something went wrong fetching your mine and packages',
          });
          setFetching(false);
        }
      })();
    }
  }, [userCtx.fetching]);

  return { mine, fetching };
}

export { AuthenticationProvider, useGetUser, userGetMine };
