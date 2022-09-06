import { useLocalStorage } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { IconX } from '@tabler/icons';
import { useNavigate } from '@tanstack/react-location';
import { getAuth } from 'firebase/auth';
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
import db from '../firebase';
import useAuthState from '../hooks/useAuthState';

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
  const { user: cred, loading, error } = useContext(AuthenticationContext);
  const [dbUser, setDbUser] = useState(null);
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
              mineId: doc.ref.parent.parent?.id,
              docId: doc.id,
              ...doc.data(),
            });
            window.localStorage.setItem('mineId', doc?.ref?.parent?.parent?.id);
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
  const [mine, setMine] = useState(null);
  const userCtx = useGetUser();

  const fetchMine = async () => {
    const docRef = doc(db, 'mines', userCtx?.user?.mineId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        mineId: docSnap.id,
        ...docSnap.data(),
      };
    } else {
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        message: 'Unable to find the mine your associated to',
      });
    }
    return null;
  };
  const fetchPackages = async (packUids: Array<string>) => {
    const data = [];
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'packages'), where('packageId', 'in', packUids))
      );
      querySnapshot.forEach((doc) => {
        data.push({
          ...doc.data(),
          packageDocId: doc.id,
        });
      });
    } catch (error) {
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
          const packs = await fetchPackages(mine?.packages);
          setMine({
            ...mine,
            packages: packs,
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
