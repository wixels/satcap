import {
  Avatar,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import {
  IconAlignLeft,
  IconChevronLeft,
  IconCircleDotted,
  IconCirclePlus,
  IconCircuitBattery,
  IconClock,
  IconDownload,
  IconExclamationMark,
  IconUser,
} from '@tabler/icons';
import { Link, useMatch } from '@tanstack/react-location';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import React from 'react';
import { IconList } from '../../components/IconList';
import { useGetSingleDiscussion } from '../../hooks/network/useDiscussions';

type Props = {};

export const Discussion = (props: Props) => {
  const {
    params: { discussionId },
  } = useMatch();
  const { data: discussion } = useGetSingleDiscussion(discussionId);
  console.log(discussion);

  const downloadMedia = () => {
    // @ts-ignore
    if (discussion?.image) {
      // @ts-ignore
      saveAs(discussion?.image, `${discussion?.title}-media`);
    } else {
      showNotification({
        icon: <IconExclamationMark size={18} />,
        color: 'orange',
        message: 'This query does not contain any media',
      });
    }
  };

  return (
    <>
      <Group position="apart" align="center" mb={'xl'}>
        <Link to="/discussions">
          <UnstyledButton
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
                {/* @ts-ignore */}
                <Text weight={700}>{discussion.title}</Text>
                <Text size="xs" color="dimmed">
                  Click here to go back
                </Text>
              </div>
            </Group>
          </UnstyledButton>
        </Link>
        <Button
          onClick={downloadMedia}
          variant="light"
          leftIcon={<IconDownload size={16} />}
        >
          Download Media
        </Button>
      </Group>
      <SimpleGrid cols={2}>
        <IconList
          icon={IconAlignLeft}
          title="Title"
          // @ts-ignore
          description={discussion?.title}
        />
        <IconList
          icon={IconCircuitBattery}
          title="Description"
          // @ts-ignore
          description={discussion?.description}
        />
        <IconList
          icon={IconCircleDotted}
          title="Status"
          // @ts-ignore
          description={discussion?.status}
        />
        <IconList
          icon={IconUser}
          title="Created By"
          // @ts-ignore
          description={discussion?.name}
        />
        <IconList
          icon={IconClock}
          title="Created At"
          // @ts-ignore
          description={dayjs(discussion?.createdAt).format('DD/MM/YYYY')}
        />
      </SimpleGrid>
    </>
  );
};
