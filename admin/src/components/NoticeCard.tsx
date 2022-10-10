import {
  ActionIcon,
  Avatar,
  Badge,
  Card,
  Group,
  Image,
  Menu,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconDots, IconLink, IconTable, IconTrash, IconX } from '@tabler/icons';
import { useNavigate } from '@tanstack/react-location';
import { useQueryClient } from '@tanstack/react-query';
import { deleteDoc, doc } from 'firebase/firestore';
import db from '../firebase';

interface Props {
  title: string;
  content?: string;
  imageUrl?: string;
  publisher?: string;
  docId: string;
  visibility?: any;
  packageName?: string;
}

export const NoticeCard = ({
  title,
  content,
  imageUrl,
  publisher,
  docId,
  visibility,
  packageName,
}: Props) => {
  console.log(packageName);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const handleDelete = async (): Promise<void> => {
    try {
      console.log('DOC ID::: ', docId);
      await deleteDoc(
        doc(db, `mines/${window.localStorage.getItem('mineId')}/notices`, docId)
      );
      queryClient.invalidateQueries(['information']);
      navigate({ to: '/information' });
    } catch (error: any) {
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        message: error?.message || 'Unable to delete notice',
        disallowClose: true,
      });
    }
  };
  return (
    <Card shadow="sm" p="lg" radius="lg" withBorder>
      <Card.Section withBorder inheritPadding py="xs">
        <Group position="apart">
          <div style={{ width: '85%', display: 'flex', gap: '1rem' }}>
            <Tooltip label={publisher}>
              <Avatar color={'green'} radius={'xl'}>
                {publisher && (
                  <>
                    {publisher?.split(' ')?.[0]?.[0]}
                    {publisher?.split(' ')?.[1]?.[0]}
                  </>
                )}
              </Avatar>
            </Tooltip>
            <div style={{ flex: 1 }}>
              <Text lineClamp={1} size="sm" weight={500}>
                {title}
              </Text>

              <Text lineClamp={1} color="dimmed" size="xs">
                {content}
              </Text>
            </div>
          </div>

          <Menu withinPortal position="bottom-end" shadow="sm">
            <Menu.Target>
              <ActionIcon>
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                onClick={handleDelete}
                icon={<IconTrash size={14} />}
                color="red"
              >
                Delete Notice
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Card.Section>
      {imageUrl ? (
        <Card.Section>
          <Image height={230} fit="cover" withPlaceholder src={imageUrl} />
        </Card.Section>
      ) : (
        <Card.Section
          color="green"
          sx={(theme) => ({
            height: '230px',
            background: theme.colors.green[0],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <IconLink color="green" size={52} />
        </Card.Section>
      )}
      <Card.Section p="lg">
        <Group>
          {visibility?.length ? (
            <Badge color="violet" variant="light">
              {visibility?.length} Operation
              {visibility?.length === 1 ? '' : 's'}
            </Badge>
          ) : null}
          <Badge color="blue" variant="light">
            Notice
          </Badge>
          <Badge color="teal" variant="light">
            {packageName}
          </Badge>
        </Group>
      </Card.Section>
    </Card>
  );
};
