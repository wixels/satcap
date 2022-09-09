import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect } from 'react';
import db from '../../firebase';
import { ILocation } from '../../types';

export async function fetchLocations() {
  const locations: ILocation[] = [];
  const locationsSnap = await getDocs(
    collection(db, `mines/${window.localStorage.getItem('mineId')}/locations`)
  );
  locationsSnap.forEach((doc) => {
    locations.push({
      ...(doc.data() as ILocation),
      id: doc.id,
    });
  });
  return locations;
}

export const useGetLocations = () => {
  return useQuery<ILocation[], any>(['locations'], fetchLocations);
};
