import {
  Avatar,
  Button,
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
import { useQueryClient } from '@tanstack/react-query';
import { doc, writeBatch } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import React, { useState } from 'react';
import { BaseQuestionFields } from '../../components/tool-editor-fields/base-question-fields';
import { MapAnswers } from '../../components/tool-editor-fields/map-answers';
import db from '../../firebase';

type Props = {};

export const CreateQuestion: React.FC<Props> = () => {
  const [loading, setLoading] = useState(false);
  const {
    params: { surveyKey },
    search: { total },
  } = useMatch();

  console.log('total::: ', total);

  const questionDefaultValues = {
    key: nanoid(8),
    id: nanoid(8),
    title: '',
    subtitle: '',
    imageUrl: null,
    type: 'single-select',
    isLocked: false,
    maxAnswerCount: null,
    order: total ? Number(total) + 1 : 0,
    reportingKey: null,
    answerId: null,
    answers: [
      {
        id: nanoid(8),
        key: nanoid(8),
        title: '',
        description: '',
        specifyAnswer: false,
        subViewRelated: false,
        subView: null,
      },
    ],
    createdAt: new Date().toISOString(),
  };

  const form = useForm({
    initialValues: {
      questions: [questionDefaultValues],
    },
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createQuestion = async (values: any) => {
    setLoading(true);
    try {
      let questionsArr: any[] = [];
      function extractQuestions(obj: any, pass: number = 1) {
        if (obj.answers && obj.answers.length > 0) {
          obj.answers.forEach((a: any) => {
            if (a.questions && a.questions.length > 0) {
              questionsArr = [...questionsArr, ...a.questions];
              a.questions.forEach((q: any) => {
                extractQuestions(q, pass + 1);
              });
            }
          });
        }
      }
      extractQuestions(values.questions[0]);
      questionsArr.push({ ...values.questions[0], surveyKey });
      const batch = writeBatch(db);
      questionsArr.forEach((q: any) => {
        batch.set(doc(db, 'questions', q.id), q);
      });
      console.log('values::: ', {
        values,
        questionsArr,
      });
      await batch.commit();

      await queryClient.invalidateQueries();
      await queryClient.invalidateQueries(['questions', surveyKey]);
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
        <Button
          radius={'md'}
          size="md"
          loading={loading}
          type="submit"
          mt={'xl'}
          fullWidth
        >
          Create Question
        </Button>
      </form>
    </>
  );
};
