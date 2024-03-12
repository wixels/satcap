import { Avatar, Button, Group, Text, UnstyledButton } from '@mantine/core';
import { IconChevronsLeft, IconCirclePlus } from '@tabler/icons';
import { Link, useMatch, useNavigate } from '@tanstack/react-location';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ToolEditorTable } from '../../components/ToolEditorTable';
import { useGetUser, userGetMine } from '../../context/AuthenticationContext';
import { useGetQuestions } from '../../hooks/network/useQuestions';

export const ToolEditor = (): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mine, fetching } = userGetMine();
  const {
    params: { surveyKey },
  } = useMatch();
  const { data: questions, isLoading } = useGetQuestions(surveyKey);
  const { user, fetching: loadingUser } = useGetUser();

  return (
    <>
      <Link to="/tool-editor">
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
              <IconChevronsLeft />
            </Avatar>
            <div>
              <Text weight={700}>Edit Survey</Text>
              <Text size="xs" color="dimmed">
                Click here to go back
              </Text>
            </div>
          </Group>
        </UnstyledButton>
      </Link>
      <Button
        to={'./create-question'}
        component={Link}
        variant="light"
        leftIcon={<IconCirclePlus />}
        mb={'md'}
      >
        Add new question
      </Button>
      {/* <pre>{JSON.stringify(questions, null, 2)}</pre> */}
      {!isLoading && questions ? <ToolEditorTable data={questions} /> : null}

      {/* <SimpleGrid
        cols={3}
        spacing="lg"
        breakpoints={[
          { maxWidth: 'md', cols: 1, spacing: 'sm' },
          { maxWidth: 'lg', cols: 2, spacing: 'lg' },
        ]}
      >
        {questions?.map((question, i) => (
          <QuestionCard
            title={question.title}
            subtitle={question.subtitle}
            id={question.id}
            order={i + 1}
            answers={question.answers}
            key={question.id}
          />
        ))}
      </SimpleGrid> */}
    </>
  );
};
