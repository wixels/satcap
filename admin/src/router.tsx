import {
  fetchDiscussions,
  fetchSingleDiscussion,
} from './hooks/network/useDiscussions';
import {
  fetchInformation,
  fetchSingleInfo,
} from './hooks/network/useInformation';
import { fetchLinks } from './hooks/network/useLinks';
import { fetchLocations } from './hooks/network/useLocations';
import { fetchMineWithPacks } from './hooks/network/useMine';
import { fetchPeople, fetchPerson } from './hooks/network/usePeople';
import { Login } from './views/auth/Login';
import { Discussion } from './views/discussions/Discussion';
import { Discussions } from './views/discussions/Discussions';
import { Home } from './views/home/Home';
import { CreatePerson } from './views/people/CreatePerson';
import { People } from './views/people/People';
import { SurveyReports } from './views/reports/SurveyReports';
import { CreateWrapper } from './views/resources/CreateWrapper';
import { Information } from './views/resources/Information';
import { EditWrapper } from './views/resources/EditWrapper';
import { SurveyLink } from './views/surveys/SurveyLink';
import { Surveys } from './views/surveys/Surveys';
import { SurveySend } from './views/surveys/SurveySend';
import { MakeGenerics, Route } from '@tanstack/react-location';
import { EditPerson } from './views/people/EditPerson';
import { SurveyReport } from './views/reports/SurveyReport';
import { fetchSingleLink } from './hooks/network/useLink';

export type LocationGenerics = MakeGenerics<{
  Params: {
    type: 'resources' | 'notices';
    typeUid: string;
    link: string;
    personId: string;
    discussionId: string;
    docId: string;
  };
}>;

export const routerFactory = (queryClient: any) => {
  const routes: Route<LocationGenerics>[] = [
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
      loader: () =>
        (queryClient.getQueryData(['locations']) &&
          queryClient.getQueryData(['mine'])) ??
        (queryClient.fetchQuery(['locations'], fetchLocations),
        queryClient.fetchQuery(['mine'], fetchMineWithPacks)),
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
          path: '/edit/:type/:typeUid',
          loader: ({ params: { type, typeUid } }) =>
            queryClient.getQueryData(['information', type, typeUid]) ??
            queryClient.fetchQuery(['information', type, typeUid], () =>
              fetchSingleInfo(type, typeUid)
            ),
          element: <EditWrapper />,
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
        queryClient.fetchQuery(['links'], () => fetchLinks(false)),
      children: [
        {
          path: '/',
          element: <Surveys />,
        },
        {
          path: ':link',
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
      children: [
        {
          path: '/',
          element: <SurveyReports />,
          loader: () =>
            queryClient.getQueryData(['linksResponses']) ??
            queryClient.fetchQuery(['linksResponses'], () => fetchLinks(true)),
        },
        {
          path: ':docId',
          element: <SurveyReport />,
          loader: ({ params: { docId } }) =>
            queryClient.getQueryData(['link', docId]) ??
            queryClient.fetchQuery(['link', docId], () =>
              fetchSingleLink(docId)
            ),
        },
      ],
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
        {
          path: ':personId/edit',
          loader: ({ params: { personId } }) =>
            (queryClient.getQueryData(['locations']) &&
              queryClient.getQueryData(['people', personId])) ??
            (queryClient.fetchQuery(['locations'], fetchLocations),
            queryClient.fetchQuery(['people', personId], () =>
              fetchPerson(personId)
            )),
          element: <EditPerson />,
        },
      ],
    },
    {
      path: '/discussions',
      loader: () =>
        queryClient.getQueryData(['discussions']) ??
        queryClient.fetchQuery(['discussions'], fetchDiscussions),
      children: [
        { path: '/', element: <Discussions /> },
        {
          path: ':discussionId',
          element: <Discussion />,
          // @ts-ignore
          loader: ({ params: { discussionId } }) =>
            queryClient.getQueryData(['discussions', discussionId]) ??
            queryClient.fetchQuery(['discussions', discussionId], () =>
              fetchSingleDiscussion(discussionId)
            ),
        },
      ],
    },
  ];
  return routes;
};
