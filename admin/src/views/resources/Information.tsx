import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  CheckIcon,
  CopyButton,
  Divider,
  Grid,
  Group,
  Image,
  Menu,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
} from "@mantine/core";
import {
  IconCirclePlus,
  IconClipboardCheck,
  IconDots,
  IconEye,
  IconFileZip,
  IconTrash,
} from "@tabler/icons";
import { Link } from "@tanstack/react-location";

export const Information = () => {
  return (
    <Stack>
      <Group mb={"1rem"} position="apart">
        <Text weight={700} size={"lg"}>
          Resources & Notices
        </Text>
        <Link to={"/information/create/resource"}>
          <Button variant="light" leftIcon={<IconCirclePlus />}>
            Create New
          </Button>
        </Link>
      </Group>

      <SimpleGrid
        cols={3}
        spacing="lg"
        breakpoints={[
          { maxWidth: "md", cols: 1, spacing: "sm" },
          { maxWidth: "lg", cols: 2, spacing: "lg" },
        ]}
      >
        <Card shadow="sm" p="lg" radius="lg" withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <Group position="apart">
              <Group>
                <Avatar color={"green"} radius={"xl"}>
                  DS
                </Avatar>
                <div style={{ flex: 1 }}>
                  <Text size="sm" weight={500}>
                    Notice Title
                  </Text>

                  <Text color="dimmed" size="xs">
                    Caption
                  </Text>
                </div>
              </Group>
              <Group>
                <Badge color="green" variant="light">
                  Notice
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
          <Card.Section sx={{ height: "25vh" }}>
            <Image src="https://images.unsplash.com/photo-1636811714614-b2738deac0eb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=940&q=80" />
          </Card.Section>
        </Card>
        <Card shadow="sm" p="lg" radius="lg" withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <Group position="apart">
              <Group>
                <Avatar color={"green"} radius={"xl"}>
                  DS
                </Avatar>
                <div style={{ flex: 1 }}>
                  <Text size="sm" weight={500}>
                    Resource Title
                  </Text>

                  <Text color="dimmed" size="xs">
                    Caption
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
          <Card.Section sx={{ height: "25vh" }}>
            <Image src="https://images.unsplash.com/photo-1618556658017-fd9c732d1360?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1964&q=80" />
          </Card.Section>
        </Card>
      </SimpleGrid>
    </Stack>
  );
};
