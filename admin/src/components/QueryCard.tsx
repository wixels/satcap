import {
  createStyles,
  Card,
  Image,
  ActionIcon,
  Group,
  Text,
  Avatar,
  Badge,
  Tooltip,
  Loader,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconTrash, IconCheck, IconX } from '@tabler/icons';
import { useQueryClient } from '@tanstack/react-query';
import { doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import db from '../firebase';

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },

  footer: {
    padding: `${theme.spacing.xs}px ${theme.spacing.lg}px`,
    marginTop: theme.spacing.md,
    borderTop: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },
}));

interface QueryCardProps {
  docId: string;
  image?: string;
  status: string;
  title: string;
  footer?: string;
  author?: {
    name?: string;
    description: string;
  };
}

export function QueryCard({
  image,
  status,
  title,
  footer,
  author,
  docId,
}: QueryCardProps) {
  const [loading, setLoading] = useState(false);
  const { classes, theme } = useStyles();
  const queryClient = useQueryClient();

  type status = 'open' | 'resolved' | 'archived';

  const handleActions = async (status: status): Promise<void> => {
    setLoading(true);
    try {
      await updateDoc(
        doc(
          db,
          `mines/${window.localStorage.getItem('mineId')}/queries`,
          docId
        ),
        {
          status,
        }
      );
      queryClient.invalidateQueries(['discussions']);
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
    <Card withBorder p="lg" radius="md" className={classes.card}>
      <Card.Section mb="sm">
        <Image src={image} alt={title} height={180} />
      </Card.Section>

      <Badge color={status === 'open' ? 'blue' : 'green'}>{status}</Badge>

      <Text weight={700} className={classes.title} mt="xs">
        {title}
      </Text>

      <Group mt="lg">
        <Avatar radius="xl">{author?.name}</Avatar>
        <div>
          <Text weight={500}>{author?.name}</Text>
          <Text size="xs" color="dimmed">
            {author?.description}
          </Text>
        </div>
      </Group>
      {status !== 'resolved' && (
        <Card.Section className={classes.footer}>
          <Group position="apart">
            <Text size="xs" color="dimmed">
              {footer}
            </Text>

            <Group spacing={0}>
              {loading && <Loader size={16} mr={'xl'} />}
              <Tooltip label="Archive Discussion">
                <ActionIcon
                  disabled={loading}
                  onClick={() => handleActions('archived')}
                >
                  <IconTrash
                    size={18}
                    color={theme.colors.red[6]}
                    stroke={1.5}
                  />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Resolve Discussion">
                <ActionIcon
                  disabled={loading}
                  onClick={() => handleActions('resolved')}
                >
                  <IconCheck
                    size={16}
                    color={theme.colors.blue[6]}
                    stroke={1.5}
                  />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Card.Section>
      )}
    </Card>
  );
}
