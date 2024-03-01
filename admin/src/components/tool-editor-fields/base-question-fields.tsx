import {
  Checkbox,
  Grid,
  NumberInput,
  Select,
  Text,
  TextInput,
} from '@mantine/core';

type Props = {
  path: string;
  form: any;
  children: React.ReactNode;
};
export const BaseQuestionFields: React.FC<Props> = ({
  path,
  form,
  children,
}) => {
  return (
    <Grid p={0}>
      <Grid.Col span={6}>
        <TextInput
          placeholder="Question Title..."
          radius={'md'}
          size="md"
          label={
            <Text size="sm" color="dimmed">
              Question Title
            </Text>
          }
          {...form.getInputProps(`${path}.title`)}
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <TextInput
          placeholder="Subtitle..."
          radius={'md'}
          size="md"
          label={
            <Text size="sm" color="dimmed">
              Subtitle
            </Text>
          }
          {...form.getInputProps(`${path}.subtitle`)}
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <TextInput
          placeholder="Image url"
          radius={'md'}
          size="md"
          label={
            <Text size="sm" color="dimmed">
              Image Url
            </Text>
          }
          {...form.getInputProps(`${path}.imageUrl`)}
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <Select
          data={['single-select', 'multi-select', 'dropdown', 'number-rating']}
          radius={'md'}
          size="md"
          label={
            <Text size="sm" color="dimmed">
              Type
            </Text>
          }
          {...form.getInputProps(`${path}.type`)}
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <Text size="sm" color="dimmed">
          Lock Question
        </Text>
        <Checkbox
          radius={'md'}
          size="md"
          label={
            <Text size="sm" color="dimmed">
              Lock This Question From Editing
            </Text>
          }
          {...form.getInputProps(`${path}.isLocked`)}
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <NumberInput
          radius={'md'}
          size="md"
          label={
            <Text size="sm" color="dimmed">
              Max Answer Count
            </Text>
          }
          {...form.getInputProps(`${path}.maxAnswerCount`)}
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <NumberInput
          radius={'md'}
          size="md"
          label={
            <Text size="sm" color="dimmed">
              Order
            </Text>
          }
          {...form.getInputProps(`${path}.order`)}
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <TextInput
          placeholder="Power BI Key"
          radius={'md'}
          size="md"
          label={
            <Text size="sm" color="dimmed">
              Reporting Key
            </Text>
          }
          {...form.getInputProps(`${path}.reportingKey`)}
        />
      </Grid.Col>
      {children}
    </Grid>
  );
};
