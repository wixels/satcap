import {
  Button,
  Center,
  FileInput,
  Grid,
  MultiSelect,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DatePicker, DateRangePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";

export const CreateResource = () => {
  const form = useForm({
    initialValues: {
      createdAt: "",
      description: "",
      packageDocId: "",
      title: "",
      visibility: [],
      timeframe: "",
      file: "",
    },
  });
  return (
    <form>
      <Grid gutter={"xl"}>
        <Grid.Col span={12}>
          <FileInput
            placeholder="Image"
            radius={"md"}
            size="md"
            label={
              <Text size="sm" color="dimmed">
                Image
              </Text>
            }
            {...form.getInputProps("file")}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            placeholder="Title"
            radius={"md"}
            size="md"
            label={
              <Text size="sm" color="dimmed">
                Title
              </Text>
            }
            {...form.getInputProps("title")}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <DatePicker
            placeholder="Pick Date"
            radius={"md"}
            size="md"
            label={
              <Text size="sm" color="dimmed">
                Date
              </Text>
            }
            {...form.getInputProps("createdAt")}
          />
        </Grid.Col>
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
                Location
              </Text>
            }
            {...form.getInputProps("visibility")}
          />
          <DateRangePicker
            size="md"
            mt={"xl"}
            label={
              <Text size="sm" color="dimmed">
                Timeframe
              </Text>
            }
            {...form.getInputProps("timeframe")}
            placeholder="Timeframe"
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
      <Center mt={"xl"}>
        <Button style={{ maxWidth: "576px" }} fullWidth radius={"md"}>
          Create Resource
        </Button>
      </Center>
    </form>
  );
};
