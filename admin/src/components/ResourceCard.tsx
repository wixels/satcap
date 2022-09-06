import {
  ActionIcon,
  Avatar,
  Badge,
  Card,
  Group,
  Image,
  Menu,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconDots, IconLink, IconTrash } from '@tabler/icons';

interface Props {
  title: string;
  content?: string;
  imageUrl?: string;
  publisher?: string;
}

export const ResourceCard = ({
  title,
  content,
  imageUrl,
  publisher,
}: Props) => {
  return (
    <Card shadow="sm" p="lg" radius="lg" withBorder>
      <Card.Section withBorder inheritPadding py="xs">
        <Group position="apart">
          <Group>
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
              <Text size="sm" weight={500}>
                {title}
              </Text>

              <Text color="dimmed" size="xs">
                {content}
              </Text>
            </div>
          </Group>
          <Group>
            <Badge color="green" variant="light">
              Resource
            </Badge>
            <Menu withinPortal position="bottom-end" shadow="sm">
              <Menu.Target>
                <ActionIcon>
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item icon={<IconTrash size={14} />} color="red">
                  Delete Notice
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Card.Section>
      {imageUrl ? (
        <Card.Section sx={{ height: '25vh' }}>
          <Image withPlaceholder src={imageUrl} />
        </Card.Section>
      ) : (
        <Card.Section
          color="green"
          sx={(theme) => ({
            height: '25vh',
            background: theme.colors.blue[0],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <IconLink color="green" size={52} />
          {/* <Image src="https://images.unsplash.com/photo-1636811714614-b2738deac0eb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=940&q=80" /> */}
        </Card.Section>
      )}
    </Card>
  );
};
