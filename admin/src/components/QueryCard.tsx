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
  Space,
  Button,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconTrash, IconCheck, IconX } from '@tabler/icons';
import { Link } from '@tanstack/react-location';
import { useQueryClient } from '@tanstack/react-query';
import { doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import db from '../firebase';
import { fetchSingleDiscussion } from '../hooks/network/useDiscussions';

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },

  footer: {
    maxHeight: '48px',
    padding: `${theme.spacing.xs}px ${theme.spacing.lg}px`,
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
  name?: string;
  description?: string;
  date: string;
}

export function QueryCard({
  status,
  title,
  footer,
  name,
  docId,
  description,
  date,
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
    <Card
      withBorder
      radius="md"
      className={classes.card}
      onMouseEnter={() => {
        queryClient.prefetchQuery(['discussions', docId], () =>
          fetchSingleDiscussion(docId)
        );
      }}
    >
      <Card.Section
        component={Link}
        px="lg"
        pt="lg"
        pb={'lg'}
        to={`./${docId}`}
      >
        <Badge color={status === 'open' ? 'blue' : 'green'}>{status}</Badge>
        <Text lineClamp={1} weight={700} className={classes.title} mt="xs">
          {title}
        </Text>
        <Text
          lineClamp={1}
          size={'sm'}
          color="dimmed"
          className={classes.title}
          mt="xs"
        >
          {description}
        </Text>

        <Group mt="lg">
          <Avatar radius="xl">
            {name && (
              <>
                {name?.split(' ')?.[0]?.[0]}
                {name?.split(' ')?.[1]?.[0]}
              </>
            )}
          </Avatar>
          <div>
            <Text weight={500} size="sm">
              {name}
            </Text>
            <Text size="xs" color="dimmed">
              {date}
            </Text>
          </div>
        </Group>
      </Card.Section>
      {status === 'archived' && (
        <Card.Section className={classes.footer}>
          <Group position="apart">
            <Text size="xs" color="dimmed">
              {footer}
            </Text>

            <Button
              size="xs"
              disabled={loading}
              onClick={() => handleActions('open')}
            >
              Unarchive
            </Button>
          </Group>
        </Card.Section>
      )}
      {status === 'open' && (
        <Card.Section className={classes.footer}>
          <Group position="apart">
            <Text size="xs" color="dimmed" />
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
