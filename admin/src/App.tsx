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
  LoadingOverlay,
  MantineProvider,
  ColorSchemeProvider,
  ColorScheme,
  ActionIcon,
  Title,
} from '@mantine/core';
import {
  IconChartPie,
  IconHome2,
  IconLayoutGrid,
  IconMessages,
  IconMoonStars,
  IconSpeakerphone,
  IconSun,
  IconUsers,
} from '@tabler/icons';
import { Link, Outlet, useNavigate } from '@tanstack/react-location';
import { useEffect, useState } from 'react';
import { UserButton } from './components/UserButton';
import useAuthState from './hooks/useAuthState';
import { getAuth } from 'firebase/auth';
import { useGetUser } from './context/AuthenticationContext';
import { useColorScheme, useHotkeys, useLocalStorage } from '@mantine/hooks';

function App(): JSX.Element {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const { user: currentAccount, fetching } = useGetUser();
  const [user, loading, error] = useAuthState(getAuth());
  const preferredColorScheme = useColorScheme();

  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'mantine-color-scheme',
    defaultValue: window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light',
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  useHotkeys([['mod+J', () => toggleColorScheme()]]);

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme }}
        withNormalizeCSS
        withGlobalStyles
      >
        <LoadingOverlay
          visible={!currentAccount && loading}
          about="This is a test"
        >
          x
        </LoadingOverlay>
        {user != null && !loading && !fetching && !error ? (
          <AppShell
            styles={(theme) => ({
              main: {
                backgroundColor:
                  theme.colorScheme === 'dark'
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
                  {currentAccount && (
                    <UserButton
                      email={currentAccount?.email}
                      image={`https://avatars.dicebear.com/api/initials/${currentAccount?.name?.[0]}.svg`}
                      name={currentAccount?.name}
                    />
                  )}
                  <Box mt={'1rem'}>
                    <Link to="/" preload={1}>
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
                    <Link to="./people" preload={1}>
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
                    <Link to="/reports" preload={1}>
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
                    <Link to="/information" preload={1}>
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
                    <Link to="/surveys" preload={1}>
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
                    <Link to="/discussions" preload={1}>
                      {({ isActive }) => {
                        return (
                          <NavLink
                            active={isActive}
                            label="Discussion Board"
                            icon={<IconMessages size={16} stroke={1.5} />}
                          />
                        );
                      }}
                    </Link>
                  </Box>
                </Navbar.Section>
                {/* <Navbar.Section>x</Navbar.Section> */}
              </Navbar>
            }
            header={
              <Header height={70} p="md">
                <Group sx={{ height: '1%' }} px={20} position="apart">
                  <Group>
                    <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                      <Burger
                        opened={opened}
                        onClick={() => setOpened((o) => !o)}
                        size="sm"
                        color={theme.colors.gray[6]}
                        mr="xl"
                      />
                    </MediaQuery>
                    <Title order={4}>SATCAP Admin</Title>
                  </Group>
                  <Group>
                    <Anchor>News</Anchor>
                    <Anchor>About</Anchor>
                    <Anchor>Help</Anchor>
                    <ActionIcon
                      variant="default"
                      onClick={() => toggleColorScheme()}
                      size={30}
                    >
                      {colorScheme === 'dark' ? (
                        <IconSun size={16} />
                      ) : (
                        <IconMoonStars size={16} />
                      )}
                    </ActionIcon>
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
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

export default App;
