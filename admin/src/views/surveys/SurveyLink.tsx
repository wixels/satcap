import {
  Avatar,
  Button,
  Center,
  Grid,
  Group,
  MultiSelect,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconChevronsLeft } from "@tabler/icons";
import { Link } from "@tanstack/react-location";
import React from "react";

export const SurveyLink = () => {
  const form = useForm({
    initialValues: {
      operation: "",
      location: "",
      description: "",
    },
  });
  return (
    <>
      <Link to="/surveys">
        <UnstyledButton
          mb={"xl"}
          p="lg"
          sx={(theme) => ({
            borderRadius: theme.radius.md,
            "&:hover": {
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[8]
                  : theme.colors.gray[1],
            },
          })}
        >
          <Group>
            <Avatar size={40} color="blue">
              <IconChevronsLeft />
            </Avatar>
            <div>
              <Text weight={700}>Create New Link </Text>
              <Text size="xs" color="dimmed">
                Click here to go back
              </Text>
            </div>
          </Group>
        </UnstyledButton>
      </Link>
      <form>
        <Grid gutter={"xl"}>
          <Grid.Col span={6}>
            <MultiSelect
              data={[
                { value: "react", label: "React" },
                { value: "ng", label: "Angular" },
                { value: "svelte", label: "Svelte" },
                { value: "vue", label: "Vue" },
                { value: "riot", label: "Riot" },
                { value: "next", label: "Next.js" },
                { value: "blitz", label: "Blitz.js" },
              ]}
              placeholder="Select Locations"
              radius={"md"}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Operation
                </Text>
              }
              {...form.getInputProps("operation")}
            />
            <MultiSelect
              mt={"xl"}
              data={[
                { value: "react", label: "React" },
                { value: "ng", label: "Angular" },
                { value: "svelte", label: "Svelte" },
                { value: "vue", label: "Vue" },
                { value: "riot", label: "Riot" },
                { value: "next", label: "Next.js" },
                { value: "blitz", label: "Blitz.js" },
              ]}
              placeholder="Select Locations"
              radius={"md"}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Location
                </Text>
              }
              {...form.getInputProps("location")}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Textarea
              placeholder="Description"
              radius={"md"}
              autosize
              minRows={5}
              label={
                <Text size="sm" color="dimmed">
                  Description
                </Text>
              }
              {...form.getInputProps("description")}
            />
          </Grid.Col>
        </Grid>
      </form>
      <Center mt={"xl"}>
        <Link to="./send">
          <Button style={{ maxWidth: "576px" }} fullWidth radius={"md"}>
            Create Link
          </Button>
        </Link>
      </Center>
    </>
  );
};
