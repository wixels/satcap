import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Image,
  Menu,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconCirclePlus,
  IconDots,
  IconFileZip,
  IconTable,
  IconTrash,
} from "@tabler/icons";
import { Link } from "@tanstack/react-location";

export const SurveyReports = () => {
  return (
    <Stack>
      <Text weight={700} size={"lg"}>
        Survey Reports
      </Text>

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
                    Survey Title
                  </Text>

                  <Text color="dimmed" size="xs">
                    Caption
                  </Text>
                </div>
              </Group>

              <Menu withinPortal position="bottom-end" shadow="sm">
                <Menu.Target>
                  <ActionIcon>
                    <IconDots size={16} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item icon={<IconFileZip size={14} />}>
                    Download
                  </Menu.Item>
                  <Menu.Item icon={<IconTrash size={14} />} color="red">
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Card.Section>
          <Card.Section
            color="green"
            sx={(theme) => ({
              height: "25vh",
              background: theme.colors.green[0],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            })}
          >
            <IconTable color="green" size={52} />
            {/* <Image src="https://images.unsplash.com/photo-1636811714614-b2738deac0eb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=940&q=80" /> */}
          </Card.Section>
        </Card>
      </SimpleGrid>
    </Stack>
  );
};
