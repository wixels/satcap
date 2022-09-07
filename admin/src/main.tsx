import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { NotificationsProvider } from '@mantine/notifications';
import { ReactLocation, Router } from '@tanstack/react-location';
import { collection, getDocs } from 'firebase/firestore';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthenticationProvider } from './context/AuthenticationContext';
import db from './firebase';
import './index.css';
import { ILink, ILocation, INotice, IResource } from './types';
import { Login } from './views/auth/Login';
import { Home } from './views/home/Home';
import { CreatePerson } from './views/people/CreatePerson';
import { People } from './views/people/People';
import { SurveyReports } from './views/reports/SurveyReports';
import { CreateWrapper } from './views/resources/CreateWrapper';
import { Information } from './views/resources/Information';
import { SurveyLink } from './views/surveys/SurveyLink';
import { Surveys } from './views/surveys/Surveys';
import { SurveySend } from './views/surveys/SurveySend';
const location = new ReactLocation();
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <MantineProvider withNormalizeCSS withGlobalStyles>
    <NotificationsProvider>
      <ModalsProvider>
        <Router
          location={location}
          routes={[
            {
              path: '/auth',

              children: [
                {
                  path: '/login',
                  element: <Login />,
                },
              ],
            },
            {
              path: '/dashboard',
              element: <Home />,
            },
            {
              path: '/information',
              loader: async () => {
                const information: Array<IResource | INotice> = [];
                const noticeSnap = await getDocs(
                  collection(
                    db,
                    `mines/${window.localStorage.getItem('mineId')}/notices`
                  )
                );
                const resourceSnap = await getDocs(
                  collection(
                    db,
                    `mines/${window.localStorage.getItem('mineId')}/resources`
                  )
                );
                noticeSnap.forEach((doc) => {
                  information.push({
                    ...(doc.data() as INotice),
                    type: 'notice',
                  });
                });
                resourceSnap.forEach((doc) => {
                  information.push({
                    ...(doc.data() as IResource),
                    type: 'resource',
                  });
                });
                return {
                  information,
                };
              },
              children: [
                {
                  path: '/',
                  element: <Information />,
                },
                {
                  path: '/create',
                  loader: async () => {
                    const locations: ILocation[] = [];
                    const locationsSnap = await getDocs(
                      collection(
                        db,
                        `mines/${window.localStorage.getItem(
                          'mineId'
                        )}/locations`
                      )
                    );
                    locationsSnap.forEach((doc) => {
                      locations.push({
                        ...(doc.data() as ILocation),
                        id: doc.id,
                      });
                    });
                    return {
                      locations,
                    };
                  },
                  element: <CreateWrapper />,
                },
              ],
            },
            {
              path: '/surveys',
              loader: async () => {
                const links: ILink[] = [];
                const linksSnap = await getDocs(
                  collection(
                    db,
                    `mines/${window.localStorage.getItem('mineId')}/links`
                  )
                );
                linksSnap.forEach((doc) => {
                  links.push({
                    ...(doc.data() as ILink),
                    docId: doc.id,
                  });
                });
                return {
                  links,
                };
              },
              children: [
                {
                  path: '/',
                  element: <Surveys />,
                },
                {
                  path: '/:link',
                  loader: async () => {
                    const locations: ILocation[] = [];
                    const locationsSnap = await getDocs(
                      collection(
                        db,
                        `mines/${window.localStorage.getItem(
                          'mineId'
                        )}/locations`
                      )
                    );
                    locationsSnap.forEach((doc) => {
                      locations.push({
                        ...(doc.data() as ILocation),
                        id: doc.id,
                      });
                    });
                    return {
                      locations,
                    };
                  },
                  children: [
                    {
                      path: '/',
                      element: <SurveyLink />,
                    },
                    {
                      path: '/send',
                      element: <SurveySend />,
                    },
                  ],
                },
              ],
            },
            {
              path: '/reports',
              element: <SurveyReports />,
            },
            {
              path: '/people',
              children: [
                {
                  path: '/',
                  element: <People />,
                },
                {
                  path: '/create',
                  element: <CreatePerson />,
                },
              ],
            },
          ]}
        >
          <AuthenticationProvider>
            <App />
          </AuthenticationProvider>
        </Router>
      </ModalsProvider>
    </NotificationsProvider>
  </MantineProvider>
);
