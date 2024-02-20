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
  docId: string;
  linkId: string;
  description?: string;
}

export const ToolCard = ({
  name,
  docId,
  description,
  linkId,
}: Props): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [opened, { close, open }] = useDisclosure(false);
  const [resLoading, setResLoading] = useState(false);

  const CORE_URL = import.meta.env.VITE_USER_URL+'/?linkId=';
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return (
    <>
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Group noWrap={true} position="apart">
            <Text truncate={true} weight={500}>{name}</Text>
          </Group>
        </Card.Section>
        <Text mt="md" size="sm" color="dimmed">
          {description}
        </Text>
        <Divider my="lg" />
        <Stack mt="lg">
          <Link to={`./${linkId}`}>
            <Button fullWidth radius="md">
              Edit
            </Button>
          </Link>
        </Stack>
      </Card>
    </>
  );
};
