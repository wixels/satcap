import { Button, Group, ScrollArea, Stack, Text } from '@mantine/core';
import { IconCirclePlus } from '@tabler/icons';
import { Link } from '@tanstack/react-location';
import { useMemo } from 'react';
import { PeopleTable } from '../../components/PeopleTable';

export const People = (): JSX.Element => {
  const data = useMemo(() => {
    const item = [];
    for (let i = 0; i < 100; i++) {
      item.push({
        firstName: `Dan ${i + 1}`,
        lastName: 'Sivewright',
        mobile: '0725077755',
        jobTitle: 'Developer',
        mine: 'Wixels',
        operation: 'Digital',
      });
    }
    return item;
  }, []);
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
