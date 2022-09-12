import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { NotificationsProvider } from '@mantine/notifications';
import { ReactLocation, Router } from '@tanstack/react-location';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthenticationProvider } from './context/AuthenticationContext';
import './index.css';
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
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { fetchLocations } from './hooks/network/useLocations';
import { fetchLinks } from './hooks/network/useLinks';
import { fetchInformation } from './hooks/network/useInformation';
import { fetchPeople } from './hooks/network/usePeople';
import { Discussions } from './views/discussions/Discussions';
import { fetchDiscussions } from './hooks/network/useDiscussions';

const location = new ReactLocation();
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools initialIsOpen={false} />

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
              path: '/',
              element: <Home />,
            },
            {
              path: '/information',
              loader: () =>
                queryClient.getQueryData(['information']) ??
                queryClient.fetchQuery(['information'], fetchInformation),
              children: [
                {
                  path: '/',
                  element: <Information />,
                },
                {
                  path: '/create',
                  loader: () =>
                    queryClient.getQueryData(['locations']) ??
                    queryClient.fetchQuery(['locations'], fetchLocations),
                  element: <CreateWrapper />,
                },
              ],
            },
            {
              path: '/surveys',
              loader: () =>
                queryClient.getQueryData(['links']) ??
                queryClient.fetchQuery(['links'], fetchLinks),
              children: [
                {
                  path: '/',
                  element: <Surveys />,
                },
                {
                  path: '/:link',
                  loader: () =>
                    queryClient.getQueryData(['locations']) ??
                    queryClient.fetchQuery(['locations'], fetchLocations),
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
              loader: () =>
                queryClient.getQueryData(['people']) ??
                queryClient.fetchQuery(['people'], fetchPeople),
              children: [
                {
                  path: '/',
                  element: <People />,
                },
                {
                  path: '/create',
                  loader: () =>
                    queryClient.getQueryData(['locations']) ??
                    queryClient.fetchQuery(['locations'], fetchLocations),
                  element: <CreatePerson />,
                },
              ],
            },
            {
              path: '/discussions',
              loader: () =>
                queryClient.getQueryData(['discussions']) ??
                queryClient.fetchQuery(['discussions'], fetchDiscussions),
              element: <Discussions />,
            },
          ]}
        >
          <AuthenticationProvider>
            <App />
          </AuthenticationProvider>
        </Router>
      </ModalsProvider>
    </NotificationsProvider>
  </QueryClientProvider>
);
