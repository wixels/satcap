import { Button, Checkbox, Divider, Grid, Text, Title } from '@mantine/core';
import { nanoid } from 'nanoid';
import React from 'react';
import { BaseQuestionFields } from './base-question-fields';
import { MapAnswers } from './map-answers';
import { IconPlus } from '@tabler/icons';

type Props = {
  questions: any[];
  path: string;
  form: any;
  surveyKey: string;
  isParentQuestionDropdown?: boolean;
};
export const MapQuestions: React.FC<Props> = ({
  questions,
  path,
  form,
  surveyKey,
}) => {
  interface FormValues {
    [key: string]: any; // You may need to adjust this based on your actual form values structure
  }

  const getObjectByString = (obj: FormValues, str: string): any => {
    const keys = str.split('.');
    return keys.reduce(
      (acc, key) => (acc && acc[key] !== 'undefined' ? acc[key] : undefined),
      obj
    );
  };

  const value = getObjectByString(form.values, path);
  console.log('value::: ', value);
  // console.log('path::: ', path);

  return (
    <Grid>
      {questions && questions?.length > 0
        ? questions.map((question, questionIndex) => (
            <React.Fragment key={question.key}>
              <BaseQuestionFields
                form={form}
                path={`${path}.questions.${questionIndex}`}
                children={
                  <>
                    <Grid.Col span={12}>
                      <Divider my={'lg'} />
                      <Title order={3}>Answers</Title>
                    </Grid.Col>
                  </>
                }
              />

              <Grid.Col span={12}>
                <MapAnswers
                  form={form}
                  answers={question.answers ?? []}
                  path={`${path}.questions.${questionIndex}`}
                  surveyKey={surveyKey}
                />
              </Grid.Col>
            </React.Fragment>
          ))
        : null}
      <Grid.Col span={6}>
        <Button
          fullWidth
          leftIcon={<IconPlus size={14} />}
          variant="light"
          onClick={() => {
            const id = nanoid(8);
            form.setFieldValue(`${path}.subView`, 'questions');
            form.setFieldValue(
              `${path}.questions`,
              value.questions ? [...value.questions] : []
            );
            form.insertListItem(`${path}.questions`, {
              key: nanoid(8),
              id,
              surveyKey,
              title: '',
              subtitle: '',
              answerId: value.id,
              type: 'single-select',
              isLocked: false,
              maxAnswerCount: null,
              answers: [],
              createdAt: new Date().toISOString(),
            });
          }}
        >
          Add Sub Question
        </Button>
      </Grid.Col>
      <Grid.Col hidden={value?.questions?.length || value?.link} span={6}>
        <Button
          fullWidth
          leftIcon={<IconPlus size={14} />}
          variant="light"
          disabled={value?.link?.name || value?.link?.url || value?.link?.title}
          onClick={() => {
            form.setFieldValue(`${path}.link`, {
              name: '',
              title: '',
              url: '',
            });
            form.setFieldValue(`${path}.subView`, 'link');
          }}
        >
          Add Condition
        </Button>
      </Grid.Col>
    </Grid>
  );
};
