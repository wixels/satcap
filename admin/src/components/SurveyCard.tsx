import {
  ActionIcon,
  Badge,
  Button,
  Card,
  CheckIcon,
  CopyButton,
  Group,
  Loader,
  Menu,
  Stack,
  Text,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconClipboardCheck, IconDots, IconTrash, IconX } from '@tabler/icons';
import { Link, useNavigate } from '@tanstack/react-location';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import db from '../firebase';
import { IError } from '../types';

interface Props {
  name: string;
  title: string;
  docId: string;
  linkId: string;
  description?: string;
}

export const SurveyCard = ({
  name,
  title,
  docId,
  description,
  linkId,
}: Props): JSX.Element => {
  const [loading, setLoading] = useState(false);

  const CORE_URL = 'https://satcap-research.web.app/?linkId=';
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await updateDoc(
        doc(db, `mines/${window.localStorage.getItem('mineId')}/links`, docId),
        {
          deletedAt: dayjs().format('YYYY-MM-DDTHH:mm:ssZ'),
        }
      );
      queryClient.invalidateQueries(['links']);
      navigate({ to: '/surveys' });
    } catch (error: any) {
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        message: error?.message || 'Unable to delete link',
        disallowClose: true,
      });
      setLoading(false);
    }
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Card.Section withBorder inheritPadding py="xs">
        <Group position="apart">
          <Text weight={500}>{name}</Text>
          <Menu withinPortal position="bottom-end" shadow="sm">
            <Menu.Target>
              <ActionIcon>
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                onClick={handleDelete}
                // icon={}
                icon={
                  loading ? <Loader size={'sm'} /> : <IconTrash size={14} />
                }
                color="red"
              >
                {loading ? 'Deleting Link' : 'Delete Link'}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Card.Section>

      <Text mt="md" size="sm" color="dimmed">
        {description}
      </Text>

      <Stack mt="lg">
        <CopyButton value={`${CORE_URL}${linkId}`}>
          {({ copied, copy }) => (
            <Button
              fullWidth
              variant="light"
              radius="md"
              color={copied ? 'teal' : 'primary'}
              leftIcon={copied ? <CheckIcon /> : <IconClipboardCheck />}
              onClick={copy}
            >
              {copied ? 'Copied' : 'Copy Url'}
            </Button>
          )}
        </CopyButton>
        <Link to={`./${linkId}/send`}>
          <Button fullWidth radius="md">
            Send Survey
          </Button>
        </Link>
      </Stack>
    </Card>
  );
};
