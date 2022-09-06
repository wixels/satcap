import { Avatar, Group, Tabs, Text, UnstyledButton } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons';
import { Link, useMatch } from '@tanstack/react-location';
import React from 'react';
import { SurveySendEmail } from './SurveySendEmail';
import { SurveySendSms } from './SurveySendSms';

export const SurveySend = (): JSX.Element => {
  const {
    params: { link },
  } = useMatch();
  return (
    <>
      <Link to={`/surveys/${link}`}>
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
              <Text weight={700}>Send Links</Text>
              <Text size="xs" color="dimmed">
                Click here to go back
              </Text>
            </div>
          </Group>
        </UnstyledButton>
      </Link>
      <Tabs defaultValue="email" mb={'xl'}>
        <Tabs.List>
          <Tabs.Tab value="email">Email Link</Tabs.Tab>
          <Tabs.Tab value="sms">SMS Link</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="email" pt="lg">
          <SurveySendEmail />
        </Tabs.Panel>

        <Tabs.Panel value="sms" pt="lg">
          <SurveySendSms />
        </Tabs.Panel>
      </Tabs>
    </>
  );
};
