import {
  Avatar,
  Button,
  Code,
  Divider,
  Grid,
  Group,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconChevronLeft, IconX } from '@tabler/icons';
import { Link, useMatch, useNavigate } from '@tanstack/react-location';
import { nanoid } from 'nanoid';
import React, { useState } from 'react';
import { BaseQuestionFields } from '../../components/tool-editor-fields/base-question-fields';
import { MapAnswers } from '../../components/tool-editor-fields/map-answers';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import db from '../../firebase';
import { useQueryClient } from '@tanstack/react-query';

type Props = {};
export const questionDefaultValues = {
  key: nanoid(8),
  id: nanoid(8),
  title: '',
  subtitle: '',
  type: 'single-select',
  isLocked: false,
  maxAnswerCount: null,
  order: 1,
  reportingKey: null,
  answerId: null,
  answers: [
    {
      id: nanoid(8),
      key: nanoid(8),
      title: '',
      specifyAnswer: false,
      subQuestionsRelated: false,
      subView: null,
    },
  ],
  createdAt: new Date().toISOString(),
};
export const answerDefaultValues = {
  id: nanoid(8),
  key: nanoid(8),
  title: '',
  specifyAnswer: false,
  subQuestionsRelated: false,
  subView: null,
  questions: [],
  link: {
    title: '',
    name: '',
    url: '',
  },
};

export const CreateQuestion: React.FC<Props> = () => {
  const [loading, setLoading] = useState(false);
  const {
    params: { surveyKey },
  } = useMatch();

  const form = useForm({
    initialValues: {
      questions: [questionDefaultValues],
    },
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const createQuestion = async (values: any) => {
    // TODO: Do validation and add subView key
    setLoading(true);
    try {
      await setDoc(doc(db, 'questions', values.questions[0].id), {
        ...values.questions[0],
        surveyKey,
      });

      queryClient.invalidateQueries();
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

  const questions = form.values.questions?.map((question, questionIndex) => (
    <Grid key={question.key}>
      <Grid.Col span={12}>
        <Grid.Col span={12}>
          <BaseQuestionFields form={form} path={`questions.${questionIndex}`}>
            <Grid.Col span={12}>
              <Divider my={'lg'} />
              <Title order={3}>Answers</Title>
            </Grid.Col>
          </BaseQuestionFields>
        </Grid.Col>

        <Grid.Col p={0} span={12}>
          <MapAnswers
            form={form}
            answers={question.answers ?? []}
            path={`questions.${questionIndex}`}
            surveyKey={surveyKey}
          />
        </Grid.Col>
      </Grid.Col>
    </Grid>
  ));

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
        {questions}
        <Button type="submit" mt={'xl'} fullWidth>
          Create Question
        </Button>
      </form>
    </>
  );
};
