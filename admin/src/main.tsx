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
import { fetchLinkResponses, fetchLinks } from './hooks/network/useLinks';
import { fetchInformation } from './hooks/network/useInformation';
import { fetchPeople } from './hooks/network/usePeople';
import { Discussions } from './views/discussions/Discussions';
import { fetchDiscussions } from './hooks/network/useDiscussions';
import { fetchMineWithPacks } from './hooks/network/useMine';
import { routerFactory } from './router';

const location = new ReactLocation();
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools initialIsOpen={false} />

    <NotificationsProvider>
      <ModalsProvider>
        {/* @ts-ignore */}
        <Router location={location} routes={routerFactory(queryClient)}>
          <AuthenticationProvider>
            <App />
          </AuthenticationProvider>
        </Router>
      </ModalsProvider>
    </NotificationsProvider>
  </QueryClientProvider>
);
