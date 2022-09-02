import {
  ActionIcon,
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
import { useNanoId } from "../../hooks/useNanoId";

export const Surveys = () => {
  const linkId = useNanoId();
  return (
    <Stack>
      <Group mb={"1rem"} position="apart">
        <Text weight={700} size={"lg"}>
          Surveys
        </Text>
        <Link to={`/surveys/${linkId}`}>
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
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <Group position="apart">
              <Text weight={500}>WP 2.2</Text>
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
          </Card.Section>
          <Group position="apart" mt="md" mb="xs">
            <Text weight={500}>Community Assessment</Text>
            <Badge color="green" variant="light">
              Notice
            </Badge>
          </Group>

          <Text size="sm" color="dimmed">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit.
            Accusantium eveniet error dolorum itaque, beatae dolor id dicta.
          </Text>

          <Stack mt="lg">
            <CopyButton value="https://mantine.dev">
              {({ copied, copy }) => (
                <Button
                  fullWidth
                  variant="light"
                  radius="md"
                  color={copied ? "teal" : "blue"}
                  leftIcon={copied ? <CheckIcon /> : <IconClipboardCheck />}
                  onClick={copy}
                >
                  {copied ? "Copied" : "Copy Url"}
                </Button>
              )}
            </CopyButton>
            <Button fullWidth color="blue" radius="md">
              Send Survey
            </Button>
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  );
};
