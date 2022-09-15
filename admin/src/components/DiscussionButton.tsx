import { Avatar, Group, Text, UnstyledButton } from '@mantine/core';
import { IconAssembly } from '@tabler/icons';
import React from 'react';

type Props = {
  title: string;
  caption: string;
  icon: JSX.Element;
  active: boolean;
  type: string;
  onClick?: React.Dispatch<React.SetStateAction<string>>;
};

export const DiscussionButton = (props: Props) => {
  return (
    <UnstyledButton
      // @ts-ignore
      onClick={() => props.onClick(props.title)}
      className={props.active ? 'active' : ''}
      p={'lg'}
      sx={(theme) => ({
        borderRadius: theme.radius.md,
        border: `1px solid ${
          theme.colorScheme === 'dark'
            ? theme.colors.dark[8]
            : theme.colors.gray[2]
        }`,
        '&:hover': {
          backgroundColor:
            theme.colorScheme === 'dark'
              ? theme.colors.dark[8]
              : theme.colors.gray[1],
        },
        '&.active': {
          border: `1px solid ${theme.colors.blue[3]}`,
          backgroundColor: theme?.colors?.blue[0],
        },
      })}
    >
      <Group>
        <Avatar size={40} color="blue">
          {props.icon}
        </Avatar>
        <div>
          <Text>{props.title}</Text>
          <Text size="xs" color="dimmed">
            {props.caption}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  );
};
