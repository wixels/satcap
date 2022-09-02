import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import { ReactLocation, Router } from "@tanstack/react-location";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Login } from "./views/auth/Login";
import { Home } from "./views/home/Home";
import { CreatePerson } from "./views/people/CreatePerson";
import { People } from "./views/people/People";
import { SurveyReports } from "./views/reports/SurveyReports";
import { CreateWrapper } from "./views/resources/CreateWrapper";
import { Information } from "./views/resources/Information";
import { SurveyLink } from "./views/surveys/SurveyLink";
import { Surveys } from "./views/surveys/Surveys";
import { SurveySend } from "./views/surveys/SurveySend";
const location = new ReactLocation();
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider withNormalizeCSS withGlobalStyles>
      <NotificationsProvider>
        <ModalsProvider>
          <Router
            location={location}
            routes={[
              {
                path: "/auth",
                children: [
                  {
                    path: "/login",
                    element: <Login />,
                  },
                ],
              },
              {
                path: "/dashboard",
                element: <Home />,
              },
              {
                path: "/information",
                children: [
                  {
                    path: "/",
                    element: <Information />,
                  },
                  {
                    path: "/create",
                    element: <CreateWrapper />,
                  },
                ],
              },
              {
                path: "/surveys",
                children: [
                  {
                    path: "/",
                    element: <Surveys />,
                  },
                  {
                    path: "/:link",
                    children: [
                      {
                        path: "/",
                        element: <SurveyLink />,
                      },
                      {
                        path: "/send",
                        element: <SurveySend />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "/reports",
                element: <SurveyReports />,
              },
              {
                path: "/people",
                children: [
                  {
                    path: "/",
                    element: <People />,
                  },
                  {
                    path: "/create",
                    element: <CreatePerson />,
                  },
                ],
              },
            ]}
          >
            <App />
          </Router>
        </ModalsProvider>
      </NotificationsProvider>
    </MantineProvider>
  </React.StrictMode>
);
