import {
  ActionIcon,
  Avatar,
  Button,
  Checkbox,
  Divider,
  Grid,
  Group,
  NumberInput,
  Select,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconChevronLeft, IconTrash, IconX } from '@tabler/icons';
import { Link, useNavigate } from '@tanstack/react-location';
import { IQuestion } from '../../types';
import { useState } from 'react';
import { showNotification } from '@mantine/notifications';
import { nanoid } from 'nanoid';
import { randomId } from '@mantine/hooks';

type Props = {};
export const CreateQuestion: React.FC<Props> = ({}) => {
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      title: '',
      subtitle: '',
      type: 'single-select',
      isLocked: false,
      answers: [
        {
          id: nanoid(8),
          title: '',
          specifyAnswer: false,
          subQuestionsRelated: false,
          key: randomId(),
          questions: [
            {
              key: nanoid(8),
              title: '',
              subtitle: '',
              type: 'single-select',
              isLocked: false,
              answers: [
                {
                  id: nanoid(8),
                  title: '',
                  specifyAnswer: false,
                  subQuestionsRelated: false,
                  key: randomId(),
                  link: {
                    title: '',
                    name: '',
                    url: '',
                  },
                },
              ],
            },
          ],
          link: {
            title: '',
            name: '',
            url: '',
          },
        },
      ],
    },
  });
  const navigate = useNavigate();
  const createQuestion = async (values: any) => {
    // TODO: Do validation and add subView key
    setLoading(true);
    try {
      //   await addDoc(collection(db, `mines/${values?.mineId}/users`), {
      //     ...values,
      //     mobile: values.mobile
      //       ? values.mobile
      //           .replaceAll(' ', '')
      //           .replaceAll('(', '')
      //           .replaceAll(')', '')
      //           .replaceAll('-', '')
      //       : '',
      //   });
      navigate({ to: '../' });
    } catch (error: any) {
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        message: error?.message || 'Unable to create question',
      });
      setLoading(false);
    }
  };
  const answers = (
    <>
      {form.values.answers.map((item, index) => (
        <Grid.Col span={12}>
          <Grid key={item.key}>
            <Grid.Col span={11}>
              <TextInput
                placeholder="Answer Title..."
                radius={'md'}
                size="md"
                label={
                  <Text size="sm" color="dimmed">
                    Answer Title
                  </Text>
                }
                style={{ flex: 1 }}
                {...form.getInputProps(`answers.${index}.title`)}
              />
            </Grid.Col>
            <Grid.Col span={1}>
              <ActionIcon
                color="red"
                onClick={() => form.removeListItem('answers', index)}
              >
                <IconTrash size="1rem" />
              </ActionIcon>
            </Grid.Col>
            <Grid.Col span={6}>
              <Checkbox
                size="md"
                label={
                  <Text size="sm" color="dimmed">
                    Specify Answer
                  </Text>
                }
                {...form.getInputProps(`answers.${index}.specifyAnswer`)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Checkbox
                size="md"
                label={
                  <Text size="sm" color="dimmed">
                    Sub Questions Related
                  </Text>
                }
                {...form.getInputProps(`answers.${index}.subQuestionsRelated`)}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Divider />
              <Title mt={'lg'} order={3}>
                Sub Questions
              </Title>
            </Grid.Col>
            <Grid.Col span={12}>
              {form.values.answers[index].questions?.map((subQ, subQIndex) => (
                <Grid pl="xl">
                  <Grid.Col span={11}>
                    <TextInput
                      placeholder="Answer Title..."
                      radius={'md'}
                      size="md"
                      label={
                        <Text size="sm" color="dimmed">
                          Answer Title
                        </Text>
                      }
                      style={{ flex: 1 }}
                      {...form.getInputProps(`answers.${index}.title`)}
                    />
                  </Grid.Col>
                  <Grid.Col span={1}>
                    <ActionIcon
                      color="red"
                      onClick={() => form.removeListItem('answers', index)}
                    >
                      <IconTrash size="1rem" />
                    </ActionIcon>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Checkbox
                      size="md"
                      label={
                        <Text size="sm" color="dimmed">
                          Specify Answer
                        </Text>
                      }
                      {...form.getInputProps(`answers.${index}.specifyAnswer`)}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Checkbox
                      size="md"
                      label={
                        <Text size="sm" color="dimmed">
                          Sub Questions Related
                        </Text>
                      }
                      {...form.getInputProps(
                        `answers.${index}.subQuestionsRelated`
                      )}
                    />
                  </Grid.Col>
                </Grid>
              ))}
            </Grid.Col>

            {/* CONDITIONAL OPTS */}
            <Grid.Col span={12}>
              <Divider mb={'md'} />
              <Text>Conditional View Options</Text>
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                placeholder="Conditional View Title..."
                radius={'md'}
                size="md"
                label={
                  <Text size="sm" color="dimmed">
                    Conditional View Title
                  </Text>
                }
                {...form.getInputProps('conditionalView.title')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                placeholder="Conditional View Link Text..."
                radius={'md'}
                size="md"
                label={
                  <Text size="sm" color="dimmed">
                    Conditional View Link Text
                  </Text>
                }
                {...form.getInputProps('conditionalView.link.text')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                placeholder="Conditional View Link URL..."
                radius={'md'}
                size="md"
                label={
                  <Text size="sm" color="dimmed">
                    Conditional View Link URL
                  </Text>
                }
                {...form.getInputProps('conditionalView.link.url')}
              />
            </Grid.Col>
          </Grid>
        </Grid.Col>
      ))}
      <Button
        onClick={() =>
          form.insertListItem('answers', {
            id: nanoid(8),
            title: '',
            specifyAnswer: false,
            subQuestionsRelated: false,
            key: randomId(),
          })
        }
      >
        Add Answer Option
      </Button>
    </>
  );
  return (
    <>
      <Link to="../">
        <UnstyledButton
          mb={'xl'}
          p="lg"
          sx={(theme) => ({
            borderRadius: theme.radius.md,
            '&:hover': {
              backgroundColor:
                theme.colorScheme === 'dark'
                  ? theme.colors.dark[8]
                  : theme.colors.gray[1],
            },
          })}
        >
          <Group>
            <Avatar size={40} color="blue">
              <IconChevronLeft />
            </Avatar>
            <div>
              <Text weight={700}>Create New Question</Text>
              <Text size="xs" color="dimmed">
                Click here to go back
              </Text>
            </div>
          </Group>
        </UnstyledButton>
      </Link>
      <form onSubmit={form.onSubmit(createQuestion)}>
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              placeholder="Title..."
              radius={'md'}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Title
                </Text>
              }
              {...form.getInputProps('title')}
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
              {...form.getInputProps('subtitle')}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Checkbox
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Lock Question
                </Text>
              }
              {...form.getInputProps('isLocked')}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <NumberInput
              placeholder="Max Answer Count..."
              radius={'md'}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Max Answer Count
                </Text>
              }
              {...form.getInputProps('maxAnswerCount')}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Select
              data={[
                { value: 'single-select', label: 'Single Select' },
                { value: 'multi-select', label: 'Multi Select' },
                { value: 'dropdown', label: 'Dropdown' },
              ]}
              placeholder="Question Type..."
              radius={'md'}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Question Type
                </Text>
              }
              {...form.getInputProps('type')}
            />
          </Grid.Col>

          <Grid.Col mt="xl" span={12}>
            <Divider />
            <Title mt={'lg'} order={3}>
              Answers
            </Title>
          </Grid.Col>
          {answers}
        </Grid>
      </form>
    </>
  );
};
