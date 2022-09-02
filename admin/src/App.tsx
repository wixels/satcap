import {
  AppShell,
  Navbar,
  Header,
  Text,
  MediaQuery,
  Burger,
  useMantineTheme,
  Group,
  NavLink,
  Anchor,
  Box,
  MantineProvider,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import {
  IconChartPie,
  IconLayoutGrid,
  IconSpeakerphone,
  IconUsers,
} from "@tabler/icons";
import {
  Link,
  Outlet,
  ReactLocation,
  Router,
  useMatches,
  useNavigate,
} from "@tanstack/react-location";
import { useEffect, useState } from "react";
import { UserButton } from "./components/UserButton";
import { Login } from "./views/auth/Login";
import { Home } from "./views/home/Home";
import { CreatePerson } from "./views/people/CreatePerson";
import { People } from "./views/people/People";
import { CreateWrapper } from "./views/resources/CreateWrapper";
import { Information } from "./views/resources/Information";
import { Surveys } from "./views/surveys/Surveys";
import { SurveyLink } from "./views/surveys/SurveyLink";
import { SurveySend } from "./views/surveys/SurveySend";
import { SurveyReports } from "./views/reports/SurveyReports";
import useAuthState from "./hooks/useAuthState";
import { getAuth } from "firebase/auth";

function App() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [user, loading, error] = useAuthState(getAuth());
  const naviagte = useNavigate();
  useEffect(() => {
    if (error || (!user && !loading)) {
      naviagte({ to: "/auth/login" });
    }
  }, [user, loading, error]);
  return (
    <>
      {user && !loading && !error ? (
        <AppShell
          styles={(theme) => ({
            main: {
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[8]
                  : theme.colors.gray[0],
            },
          })}
          navbarOffsetBreakpoint="sm"
          asideOffsetBreakpoint="sm"
          navbar={
            <Navbar
              p="md"
              hiddenBreakpoint="sm"
              hidden={!opened}
              width={{ sm: 200, lg: 300 }}
            >
              <Navbar.Section grow mt="md">
                <UserButton
                  email="dan@wixels.com"
                  image="https://avatars.dicebear.com/api/initials/ds.svg"
                  name="Dan Sivewright"
                />
                <Box mt={"1rem"}>
                  {/* <Link to="/dashboard">
           {({ isActive }) => {
             return (
               <NavLink
                 active={isActive}
                 label="Home"
                 icon={<IconHome2 size={16} stroke={1.5} />}
               />
             );
           }}
         </Link> */}
                  <Link to="./people">
                    {({ isActive }) => {
                      return (
                        <NavLink
                          active={isActive}
                          label="People"
                          icon={<IconUsers size={16} stroke={1.5} />}
                        />
                      );
                    }}
                  </Link>
                  <Link to="/reports">
                    {({ isActive }) => {
                      return (
                        <NavLink
                          active={isActive}
                          label="Survey Reports"
                          icon={<IconChartPie size={16} stroke={1.5} />}
                        />
                      );
                    }}
                  </Link>
                  <Link to="/information">
                    {({ isActive }) => {
                      return (
                        <NavLink
                          active={isActive}
                          label="Information"
                          icon={<IconSpeakerphone size={16} stroke={1.5} />}
                        />
                      );
                    }}
                  </Link>
                  <Link to="/surveys">
                    {({ isActive }) => {
                      return (
                        <NavLink
                          active={isActive}
                          label="Surveys"
                          icon={<IconLayoutGrid size={16} stroke={1.5} />}
                        />
                      );
                    }}
                  </Link>
                  {/* <NavLink
           label="Discussion Board"
           icon={<IconMessages size={16} stroke={1.5} />}
         /> */}
                </Box>
              </Navbar.Section>
              <Navbar.Section>x</Navbar.Section>
            </Navbar>
          }
          header={
            <Header height={70} p="md">
              <Group sx={{ height: "100%" }} px={20} position="apart">
                <Group>
                  <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                    <Burger
                      opened={opened}
                      onClick={() => setOpened((o) => !o)}
                      size="sm"
                      color={theme.colors.gray[6]}
                      mr="xl"
                    />
                  </MediaQuery>
                  <Text>Application header</Text>
                </Group>
                <Group>
                  <Anchor>News</Anchor>
                  <Anchor>About</Anchor>
                  <Anchor>Help</Anchor>
                </Group>
              </Group>
            </Header>
          }
        >
          <Outlet />
        </AppShell>
      ) : (
        <Outlet />
      )}
    </>
  );
}

export default App;
