import { Avatar, Group, Tabs, Text, UnstyledButton } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons';
import { Link } from '@tanstack/react-location';
import { collection, query } from 'firebase/firestore';
import React from 'react';
import db from '../../firebase';
import { CreateNotice } from './CreateNotice';
import { CreateResource } from './CreateResource';

export const CreateWrapper = (): JSX.Element => {
  return (
    <>
      <Link to="/information">
        <UnstyledButton
          mb={'xl'}
          p="lg"
          sx={(theme) => ({
            borderRadius: theme.radius.md,
            '&:hover': {
              backgroundColor:
                theme.colorScheme === 'dark'
                  ? theme.colors.dark[8]
                  : theme.colors.gray[1],
            },
          })}
        >
          <Group>
            <Avatar size={40} color="blue">
              <IconChevronLeft />
            </Avatar>
            <div>
              <Text weight={700}>Create New Survey </Text>
              <Text size="xs" color="dimmed">
                Click here to go back
              </Text>
            </div>
          </Group>
        </UnstyledButton>
      </Link>
      <Tabs defaultValue="resource" mb={'xl'}>
        <Tabs.List>
          <Tabs.Tab value="resource">Resource</Tabs.Tab>
          <Tabs.Tab value="notice">Notice</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="resource" pt="lg">
          <CreateResource />
        </Tabs.Panel>

        <Tabs.Panel value="notice" pt="lg">
          <CreateNotice />
        </Tabs.Panel>
      </Tabs>
    </>
  );
};
