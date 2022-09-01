import { ActionIcon, Button, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconTrash } from "@tabler/icons";
import { nanoid } from "nanoid";
import React from "react";

export const SurveySendEmail = () => {
  const form = useForm({
    initialValues: {
      emails: [{ email: "", key: nanoid() }],
    },
  });

  const fields = form.values.emails.map((item, index) => (
    <Group key={item.key} mt="xs">
      <TextInput
        placeholder="John Doe"
        withAsterisk
        type="email"
        sx={{ flex: 1 }}
        {...form.getInputProps(`employees.${index}.name`)}
      />

      <ActionIcon
        color="red"
        onClick={() => form.removeListItem("emails", index)}
      >
        <IconTrash size={16} />
      </ActionIcon>
    </Group>
  ));
  return (
    <form>
      {fields}
      <Group position="center" mt="md">
        <Button variant="subtle">Upload CSV</Button>
        <Button
          variant="light"
          onClick={() =>
            form.insertListItem("emails", {
              email: "",
              key: nanoid(),
            })
          }
        >
          Add Email
        </Button>
        <Button>Send Links</Button>
      </Group>
    </form>
  );
};
