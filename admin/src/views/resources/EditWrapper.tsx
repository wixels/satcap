import { Avatar, Group, Text, UnstyledButton } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons';
import { Link, useMatch } from '@tanstack/react-location';
import React from 'react';
import { useGetSingleInformation } from '../../hooks/network/useInformation';
import { INotice, IResource } from '../../types';
import { EditNotice } from './EditNotice';
import { EditResource } from './EditResource';

export const EditWrapper = () => {
  const {
    params: { type, typeUid },
  } = useMatch();
  // @ts-ignore
  const { data: information } = useGetSingleInformation(type, typeUid);
  console.log(information);
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
              <Text transform="capitalize" weight={700}>
                {/* @ts-ignore */}
                Edit {type.slice(0, -1)}: {information?.title}
              </Text>
              <Text size="xs" color="dimmed">
                Click here to go back
              </Text>
            </div>
          </Group>
        </UnstyledButton>
      </Link>
      {type === 'notices' ? (
        <EditNotice {...(information as INotice)} />
      ) : (
        <EditResource {...(information as IResource)} />
      )}
    </>
  );
};
