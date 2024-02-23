import {
  ActionIcon,
  Button,
  Checkbox,
  Flex,
  Grid,
  Text,
  TextInput,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons';

type Props = {
  path: string;
  form: any;
  index: number;
};
export const BaseAnswerFields: React.FC<Props> = ({
  //
  path,
  form,
  index,
}) => {
  interface FormValues {
    [key: string]: any;
  }

  const getObjectByString = (obj: FormValues, str: string): any => {
    const keys = str.split('.');
    return keys.reduce(
      (acc, key) => (acc && acc[key] !== 'undefined' ? acc[key] : undefined),
      obj
    );
  };

  const value = getObjectByString(form.values, path);
  // console.log(
  //   'path::: ',
  //   path
  //     .split('.')
  //     .slice(0, path.split('.').length - 1)
  //     .join('.')
  // );
  return (
    <>
      <Grid.Col span={12}>
        <Flex align="end" gap="sm">
          <TextInput
            style={{
              flexGrow: 1,
            }}
            placeholder="Answer Title..."
            radius={'md'}
            size="md"
            label={
              <Text size="sm" color="dimmed">
                Answer Title
              </Text>
            }
            {...form.getInputProps(`${path}.title`)}
          />
          <ActionIcon
            color="red"
            size={'xl'}
            onClick={() =>
              form.removeListItem(
                path
                  .split('.')
                  .slice(0, path.split('.').length - 1)
                  .join('.'),
                index
              )
            }
          >
            <IconTrash size="1rem" />
          </ActionIcon>
        </Flex>
      </Grid.Col>
      <Grid.Col span={6}>
        <Text size="sm" color="dimmed">
          Add "Please Specify"
        </Text>
        <Checkbox
          radius={'md'}
          size="md"
          label={
            <Text size="sm" color="dimmed">
              Show text input if answer is selected
            </Text>
          }
          {...form.getInputProps(`${path}.specifyAnswer`)}
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <Text size="sm" color="dimmed">
          Sub Questions Related
        </Text>
        <Checkbox
          radius={'md'}
          size="md"
          label={
            <Text size="sm" color="dimmed">
              Questions are part of answer ( i.e 1.1 )
            </Text>
          }
          {...form.getInputProps(`${path}.subQuestionsRelated`)}
        />
      </Grid.Col>
      {value.link && (
        <>
          <Grid.Col span={6}>
            <TextInput
              placeholder="Link Title..."
              radius={'md'}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Link Title
                </Text>
              }
              {...form.getInputProps(`${path}?.link?.title`)}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              placeholder="Link Name..."
              radius={'md'}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Link Name
                </Text>
              }
              {...form.getInputProps(`${path}?.link?.name`)}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput
              placeholder="Link URL..."
              radius={'md'}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Link URL
                </Text>
              }
              {...form.getInputProps(`${path}?.link?.url`)}
            />
          </Grid.Col>
        </>
      )}
    </>
  );
};
