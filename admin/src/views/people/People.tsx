import { Button, Group, ScrollArea, Stack, Text } from '@mantine/core';
import { IconCirclePlus } from '@tabler/icons';
import { Link, useNavigate } from '@tanstack/react-location';
import { useGetPeople } from '../../hooks/network/usePeople';
// @ts-ignore
import { PeopleTable } from '../../components/PeopleTable';
import { useGetUser } from '../../context/AuthenticationContext';
import { useEffect } from 'react';
import { useLocalStorage } from '@mantine/hooks';

export const People = (): JSX.Element => {
  const { user: currentAccount, fetching } = useGetUser();

  const navigate = useNavigate();

  useEffect(() => {
    if (!fetching && !currentAccount?.isAdmin) navigate({ to: '/' });
  }, [currentAccount?.isAdmin, fetching]);

  const { data } = useGetPeople();
  const PAGE_TITLE = 'Manage People';
  const [_, setTitle] = useLocalStorage({
    key: 'title',
  });
  useEffect(() => {
    setTitle(PAGE_TITLE);
  }, []);
  return (
    <Stack>
      <Link to={'/people/create'}>
        <Button variant="light" leftIcon={<IconCirclePlus />}>
          Add new admin user
        </Button>
      </Link>
      <ScrollArea style={{ height: 'calc(100vh - 172px)' }}>
        <PeopleTable data={data} />
      </ScrollArea>
    </Stack>
  );
};
