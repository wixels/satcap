import {
  ActionIcon,
  Button,
  Card,
  CheckIcon,
  CopyButton,
  Divider,
  Group,
  Loader,
  Menu,
  Modal,
  Stack,
  Switch,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { IconClipboardCheck, IconDots, IconTrash, IconX } from '@tabler/icons';
import { Link, useNavigate } from '@tanstack/react-location';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import db from '../firebase';

interface Props {
  name: string;
  title: string;
  docId: string;
  linkId: string;
  description?: string;
  acceptResponses: boolean;
}

export const SurveyCard = ({
  name,
  title,
  docId,
  description,
  linkId,
  acceptResponses,
}: Props): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [opened, { close, open }] = useDisclosure(false);
  const [resLoading, setResLoading] = useState(false);

  const CORE_URL = import.meta.env.VITE_USER_URL+'/?linkId=';
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function handleUpdate(
    payload: { deletedAt?: string; acceptResponses?: boolean },
    redirect?: boolean
  ) {
    setLoading(true);
    try {
      await updateDoc(
        doc(db, `mines/${window.localStorage.getItem('mineId')}/links`, docId),
        payload
      );
      queryClient.invalidateQueries(['links']);
      redirect && navigate({ to: '/surveys' });
    } catch (error: any) {
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        message: error?.message || 'Unable to delete link',
        disallowClose: true,
      });
      setLoading(false);
    }
  }

  return (
    <>
      <Modal opened={opened} onClose={close} size="auto">
        <Title order={5}>Are you sure you want to delete?</Title>
        <Text color="dimmed" mb={'xl'}>
          This action cannot be undone
        </Text>
        <Button
          loading={loading}
          fullWidth
          color={'red'}
          onClick={() =>
            handleUpdate(
              { deletedAt: dayjs().format('YYYY-MM-DDTHH:mm:ssZ') },
              true
            )
          }
        >
          Delete
        </Button>
      </Modal>
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Group noWrap={true} position="apart">
            <Text truncate={true} weight={500}>{name}</Text>
            <Menu withinPortal position="bottom-end" shadow="sm">
              <Menu.Target>
                <ActionIcon>
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  icon={
                    loading ? <Loader size={'sm'} /> : <IconTrash size={14} />
                  }
                  onClick={open}
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
        <Divider my="lg" />
        <Switch
          checked={acceptResponses}
          disabled={resLoading}
          onChange={async (event) => {
            setResLoading(true);
            await handleUpdate(
              { acceptResponses: event.currentTarget.checked },
              true
            );
            setResLoading(false);
          }}
          // onChange={(event) => setChecked()}
          color="teal"
          size="sm"
          label="Accepting Responses"
          onLabel="ON"
          offLabel="OFF"
        />
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
    </>
  );
};
