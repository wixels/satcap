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
  id: string;
  title: string;
  subtitle?: string;
  answers?: any[];
  order: int;
}

export const QuestionCard = ({
  id,
  title,
  subtitle,
  answers,
  order,
}: Props): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [opened, { close, open }] = useDisclosure(false);
  const [resLoading, setResLoading] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return (
    <>
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Group noWrap={true} position="apart">
            <Text truncate={true} weight={600}>Question {order}</Text>
          </Group>
          <Text weight={500}>{title}</Text>
        </Card.Section>
        <Text mt="md" size="sm" color="dimmed">
          
          {subtitle}
        </Text>
        <Text mt="md" size="sm" color="dimmed">
          Number of answers: {answers?.length || 0}
        </Text>
        <Divider my="lg" />
        <Stack mt="lg">
        </Stack>
      </Card>
    </>
  );
};
