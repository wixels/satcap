import { Button, Checkbox, Divider, Grid, Text } from '@mantine/core';
import { nanoid } from 'nanoid';
import React, { useEffect, useState } from 'react';
import { BaseAnswerFields } from './base-answer-fields';
import { MapQuestions } from './map-questions';

type Props = {
  answers: any[];
  path: string;
  form: any;
  surveyKey: string;
};
export const MapAnswers: React.FC<Props> = ({
  answers,
  surveyKey,
  path,
  form,
}) => {
  const [autoAnswers, setAutoAnswers] = useState(false);
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
  useEffect(() => {
    if (value.type !== 'dropdown') {
      setAutoAnswers(false);
    } else {
      form.setFieldValue(`${path}.autoAnswers`, null);
    }
  }, [value.type]);
  return (
    <Grid
      style={{
        marginLeft: '1rem',
        paddingLeft: '1rem',
        borderLeft: '1px solid #CED4D9',
      }}
    >
      {value.type === 'dropdown' && (
        <Grid.Col span={12}>
          <Text size="sm" color="dimmed">
            Auto Answers
          </Text>
          <Checkbox
            onChange={(e) => {
              setAutoAnswers(e.target.checked);
              if (e.target.checked) {
                form.setFieldValue(`${path}.autoAnswers`, 'area');
                form.setFieldValue(`${path}.answers`, []);
              }
            }}
            radius={'md'}
            size="md"
            label={
              <Text size="sm" color="dimmed">
                Use area answers
              </Text>
            }
          />
        </Grid.Col>
      )}

      {autoAnswers ? null : (
        <>
          {answers && answers?.length > 0
            ? answers.map((answer, answersIndex) => (
                <React.Fragment key={answer.key}>
                  <BaseAnswerFields
                    index={answersIndex}
                    form={form}
                    path={`${path}.answers.${answersIndex}`}
                  />

                  <Grid.Col span={12}>

                    <MapQuestions
                      isParentQuestionDropdown={value.type === 'dropdown'}
                      form={form}
                      path={`${path}.answers.${answersIndex}`}
                      questions={answer.questions ?? []}
                      surveyKey={surveyKey}
                    />
                    
                  </Grid.Col>
                </React.Fragment>
              ))
            : null}

          <Grid.Col span={12}>
            <Button
              onClick={() =>
                form.insertListItem(`${path}.answers`, {
                  id: nanoid(8),
                  key: nanoid(8),
                  title: '',
                  specifyAnswer: false,
                  subQuestionsRelated: false,
                  subView: null,
                  // questions: [],
                })
              }
            >
              Add Answer
            </Button>
          </Grid.Col>
          <Grid.Col span={12}>
            <Divider my="lg" />
          </Grid.Col>
        </>
      )}
    </Grid>
  );
};
