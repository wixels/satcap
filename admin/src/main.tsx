import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { NotificationsProvider } from '@mantine/notifications';
import { ReactLocation, Router } from '@tanstack/react-location';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthenticationProvider } from './context/AuthenticationContext';
import './index.css';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { LocationGenerics, routerFactory } from './router';

const location = new ReactLocation<LocationGenerics>();
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
