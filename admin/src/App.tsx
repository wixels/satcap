import {
  AppShell,
  Navbar,
  Header,
  MediaQuery,
  Burger,
  useMantineTheme,
  Group,
  NavLink,
  Box,
  LoadingOverlay,
  MantineProvider,
  ColorSchemeProvider,
  ColorScheme,
  ActionIcon,
  Title,
  Menu,
  Image,
  Text,
  Divider,
  Space,
} from '@mantine/core';
import {
  IconChartPie,
  IconHome2,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconLogout,
  IconMessages,
  IconMoonStars,
  IconSettings,
  IconSpeakerphone,
  IconSun,
  IconUsers,
} from '@tabler/icons';
import { Outlet } from '@tanstack/react-location';
import { useState, useEffect } from 'react';
import { UserButton } from './components/UserButton';
import useAuthState from './hooks/useAuthState';
import { getAuth, signOut } from 'firebase/auth';
import { useGetUser, userGetMine } from './context/AuthenticationContext';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';
import { auth } from './firebase';
import { NavbarLink } from './components/NavbarLink';
import { useQueryClient } from '@tanstack/react-query';

function App(): JSX.Element {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const { user: currentAccount, fetching } = useGetUser();
  const { mine, fetching: fetchingMine } = userGetMine();
  const [user, loading, error] = useAuthState(getAuth());
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'mantine-color-scheme',
    defaultValue: window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light',
    getInitialValueInEffect: true,
  });
  const [title, setTitle] = useLocalStorage({
    key: 'title',
    defaultValue: '',
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  useHotkeys([['mod+J', () => toggleColorScheme()]]);

  // @ts-ignore
  String.prototype.toSentenceCase = function () {
    const str = this.toLowerCase().split(' ');
    for (let i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(' ');
  };
  const queryClient = useQueryClient();

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{
          colorScheme,
          colors: {
            blue: [
              '#eaefff',
              '#c9ceed',
              '#a6aedb',
              '#838ec9',
              '#606db9',
              '#46549f',
              '#435098',
              '#262f5a',
              '#151c39',
              '#06081a',
            ],
          },
        }}
        withNormalizeCSS
        withGlobalStyles
      >
        <LoadingOverlay
          visible={!currentAccount && loading}
          about="This is a test"
        />
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
                // p="md"
                hiddenBreakpoint="md"
                hidden={!opened}
                width={{ md: 300 }}
              >
                <Navbar.Section grow mt="md">
                  <UserButton
                    email={currentAccount?.email}
                    image={`https://avatars.dicebear.com/api/initials/${currentAccount?.name?.[0]}.svg`}
                    name={currentAccount?.name}
                  />
                  <Box mt={'1rem'}>
                    <NavbarLink
                      onClick={() => { setTitle('Home') }}
                      path="/"
                      icon={<IconHome2 size={22} stroke={1.5} />}
                      label="Home"
                    />
                    <NavbarLink
                      onClick={() => { setTitle('Dashboard') }}
                      path="/dashboard"
                      icon={<IconLayoutDashboard size={22} stroke={1.5} />}
                      label="Dashboard"
                    />
                    {currentAccount?.isAdmin && (
                      <div>
                        <NavbarLink
                          onClick={() => { setTitle('Manage People') }}
                          path="/people"
                          label="People"
                          icon={<IconUsers size={22} stroke={1.5} />}
                        />
                        <NavbarLink
                          onClick={() => { setTitle('Tool Editor') }}
                          path="/tool-editor"
                          label="Tool Editor"
                          icon={<IconSettings size={22} stroke={1.5} />}
                        />
                      </div>
                    )}
                    {mine?.scopes?.includes('survey') && (
                      <NavbarLink
                        onClick={() => { setTitle('Survey Reports') }}
                        path="/reports"
                        label="Survey Reports"
                        icon={<IconChartPie size={22} stroke={1.5} />}
                      />
                    )}
                    {mine?.scopes?.includes('information') && (
                      <NavbarLink
                        onClick={() => { setTitle('Resources & Notices') }}
                        path="/information"
                        label="Information"
                        icon={<IconSpeakerphone size={22} stroke={1.5} />}
                      />
                    )}

                    {mine?.scopes?.includes('survey') && (
                      <NavbarLink
                        onClick={() => { setTitle('Surveys') }}
                        path="/surveys"
                        label="Surveys"
                        icon={<IconLayoutGrid size={22} stroke={1.5} />}
                      />
                    )}

                    {mine?.scopes?.includes('queries') && (
                      <NavbarLink
                        onClick={() => { setTitle('Query Submissions') }}
                        path="/discussions"
                        label="Query Submissions"
                        icon={<IconMessages size={22} stroke={1.5} />}
                      />
                    )}

                    {/* icon={<IconLogout size={22} />}
                      >
                        Logout */}
                    <NavbarLink
                      path="/auth/login"
                      onClick={() => {
                        queryClient.removeQueries();
                        signOut(auth);
                        window.localStorage.clear();
                      }}
                      label="Logout"
                      icon={<IconLogout size={22} stroke={1.5} />}
                    />
                  </Box>
                </Navbar.Section>
                {/* <Navbar.Section>x</Navbar.Section> */}
              </Navbar>
            }
            header={
              <Header height={70} p="md">
                <Group sx={{ height: '1%' }} px={20} position="apart">
                  <Group>
                    <MediaQuery largerThan="md" styles={{ display: 'none' }}>
                      <Burger
                        opened={opened}
                        onClick={() => setOpened((o) => !o)}
                        size="sm"
                        color={theme.colors.gray[6]}
                        mr="xl"
                      />
                    </MediaQuery>
                    <Image
                      width={40}
                      radius="md"
                      src={
                        '/logo.png'
                      }
                      alt="Random unsplash image"
                    />
                    <Title order={4} mr="lg">
                      SATCAP Admin
                    </Title>
                    <MediaQuery smallerThan="md" styles={{ display: 'none' }}>
                      <Space />
                    </MediaQuery>
                    <MediaQuery smallerThan="md" styles={{ display: 'none' }}>
                      <Divider ml="xl" orientation="vertical" />
                    </MediaQuery>

                    <Text weight={700} size={'lg'}>
                      {title}
                    </Text>
                  </Group>
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
