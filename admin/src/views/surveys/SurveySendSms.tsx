import {
  ActionIcon,
  Button,
  Group,
  NumberInput,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconTrash } from "@tabler/icons";
import { nanoid } from "nanoid";
import React from "react";

export const SurveySendSms = () => {
  const form = useForm({
    initialValues: {
      mobiles: [{ mobile: "", key: nanoid() }],
    },
  });

  const fields = form.values.mobiles.map((item, index) => (
    <Group key={item.key} mt="xs">
      <NumberInput
        placeholder="+27..."
        withAsterisk
        hideControls
        sx={{ flex: 1 }}
        {...form.getInputProps(`mobiles.${index}.name`)}
      />

      <ActionIcon
        color="red"
        onClick={() => form.removeListItem("mobiles", index)}
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
            form.insertListItem("mobiles", {
              mobile: "",
              key: nanoid(),
            })
          }
        >
          Add Mobile Number
        </Button>
        <Button>Send Links</Button>
      </Group>
    </form>
  );
};
