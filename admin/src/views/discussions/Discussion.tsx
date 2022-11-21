import {
  Avatar,
  Button,
  Divider,
  Group,
  SimpleGrid,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import {
  IconAddressBook,
  IconAlignLeft,
  IconChevronLeft,
  IconCircleDotted,
  IconCircuitBattery,
  IconClock,
  IconDownload,
  IconExclamationMark,
  IconUser,
  IconX,
} from '@tabler/icons';
import { Link, useMatch, useNavigate } from '@tanstack/react-location';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { IconList } from '../../components/IconList';
import db from '../../firebase';
import { useGetSingleDiscussion } from '../../hooks/network/useDiscussions';
import { LocationGenerics } from '../../router';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);

type Props = {};

export const Discussion = (props: Props) => {
  const {
    params: { discussionId },
  } = useMatch<LocationGenerics>();
  const { data: discussion } = useGetSingleDiscussion(discussionId);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const downloadMedia = () => {
    if (discussion?.image) {
      saveAs(discussion?.image, `${discussion?.title}-media`);
    } else {
      showNotification({
        icon: <IconExclamationMark size={18} />,
        color: 'orange',
        message: 'This query does not contain any media',
      });
    }
  };

  type status = 'open' | 'resolved' | 'archived';
  const handleActions = async (status: status): Promise<void> => {
    setLoading(true);
    try {
      await updateDoc(
        doc(
          db,
          `mines/${window.localStorage.getItem('mineId')}/queries`,
          discussionId
        ),
        {
          status,
        }
      );
      queryClient.invalidateQueries(['discussions']);
      queryClient.invalidateQueries(['discussions', discussionId]);
      setLoading(false);
    } catch (error: any) {
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        message: error?.message || 'Unable to archive discussion',
        disallowClose: true,
      });
      setLoading(false);
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
      </Group>

      <SimpleGrid cols={2}>
        <IconList
          icon={IconAlignLeft}
          title="Title"
          description={discussion?.title}
        />

        <IconList
          icon={IconCircleDotted}
          title="Status"
          description={discussion?.status}
        />
        <IconList
          icon={IconUser}
          title="Created By"
          description={discussion?.name}
        />
        <IconList
          icon={IconClock}
          title="Created At"
          description={dayjs(discussion?.createdAt).format('LL')}
        />
        <IconList
          icon={IconAddressBook}
          title="Contact Details"
          description={discussion?.contact}
        />
        <IconList
          icon={IconCircuitBattery}
          title="Description"
          description={discussion?.description}
        />
      </SimpleGrid>
      <Group position="center" mt="md">
        <Button
          onClick={downloadMedia}
          variant="light"
          leftIcon={<IconDownload size={16} />}
          fullWidth
          style={{ maxWidth: '300px' }}
        >
          Download Attachment
        </Button>
        <Tooltip
          label={
            discussion?.status !== 'open'
              ? 'This discussion has already been handled'
              : 'Archive'
          }
        >
          <Button
            fullWidth
            style={{ maxWidth: '300px' }}
            color="red"
            variant="light"
            disabled={loading}
            onClick={() =>
              discussion?.status === 'open' && handleActions('archived')
            }
          >
            Archive
          </Button>
        </Tooltip>
        <Tooltip
          label={
            discussion?.status !== 'open'
              ? 'This discussion has already been handled'
              : 'Mark as Resolved'
          }
        >
          <Button
            fullWidth
            style={{ maxWidth: '300px' }}
            type="submit"
            disabled={loading}
            onClick={() =>
              discussion?.status === 'open' && handleActions('resolved')
            }
          >
            Mark as Resolved
          </Button>
        </Tooltip>
      </Group>
    </>
  );
};
