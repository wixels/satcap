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
} from "@mantine/core";
import {
  IconChartPie,
  IconHome2,
  IconLayoutGrid,
  IconMessages,
  IconSpeakerphone,
  IconUsers,
} from "@tabler/icons";
import { Link, Outlet, ReactLocation, Router } from "@tanstack/react-location";
import { useState } from "react";
import { UserButton } from "./components/UserButton";
import { Login } from "./views/auth/Login";
import { Home } from "./views/home/Home";
import { People } from "./views/people/People";

function App() {
  const location = new ReactLocation();
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  return (
    <Router
      location={location}
      routes={[
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/dashboard",
          element: <Home />,
        },
        {
          path: "/people",
          element: <People />,
        },
      ]}
    >
      <AppShell
        styles={{
          main: {
            background:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        }}
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
                <Link to="/dashboard">
                  {({ isActive }) => {
                    return (
                      <NavLink
                        active={isActive}
                        label="Home"
                        icon={<IconHome2 size={16} stroke={1.5} />}
                      />
                    );
                  }}
                </Link>
                <Link to="/people">
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
                <NavLink
                  label="Survey Reports"
                  icon={<IconChartPie size={16} stroke={1.5} />}
                />
                <NavLink
                  label="Resources"
                  icon={<IconSpeakerphone size={16} stroke={1.5} />}
                />
                <NavLink
                  label="Surveys"
                  icon={<IconLayoutGrid size={16} stroke={1.5} />}
                />
                <NavLink
                  label="Discussion Board"
                  icon={<IconMessages size={16} stroke={1.5} />}
                />
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
    </Router>
  );
}

export default App;
