import { Button, Group, ScrollArea, Stack, Text } from '@mantine/core';
import { IconCirclePlus } from '@tabler/icons';
import { Link, useNavigate } from '@tanstack/react-location';
import { useGetPeople } from '../../hooks/network/usePeople';
// @ts-ignore
import { PeopleTable } from '../../components/PeopleTable';
import { useGetUser } from '../../context/AuthenticationContext';
import { useEffect } from 'react';

export const People = (): JSX.Element => {
  const { user: currentAccount, fetching } = useGetUser();

  const navigate = useNavigate();

  useEffect(() => {
    if (!fetching && !currentAccount?.isAdmin) navigate({ to: '/' });
  }, [currentAccount?.isAdmin, fetching]);

  const { data } = useGetPeople();
  return (
    <Stack>
      <Group mb={'1rem'} position="apart">
        <Text weight={700} size={'lg'}>
          Manage People
        </Text>
        <Link to={'/people/create'}>
          <Button variant="light" leftIcon={<IconCirclePlus />}>
            Add new admin user
          </Button>
        </Link>
      </Group>
      <ScrollArea style={{ height: 'calc(100vh - 172px)' }}>
        <PeopleTable data={data} />
      </ScrollArea>
    </Stack>
  );
};
