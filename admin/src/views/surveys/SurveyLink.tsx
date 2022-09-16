import {
  ActionIcon,
  Avatar,
  Button,
  Center,
  Grid,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconChevronsLeft, IconTrash, IconX } from '@tabler/icons';
import { Link, useMatch, useNavigate } from '@tanstack/react-location';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { addDoc, collection } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { useMemo, useState } from 'react';
import { useGetUser, userGetMine } from '../../context/AuthenticationContext';
import db from '../../firebase';
import { useGetLocations } from '../../hooks/network/useLocations';

export const SurveyLink = (): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const naviagte = useNavigate();
  const queryClient = useQueryClient();
  const { mine, fetching } = userGetMine();
  const {
    params: { link },
  } = useMatch();
  const { data: locations, isLoading } = useGetLocations();
  const { user, fetching: loadingUser } = useGetUser();

  const form = useForm({
    initialValues: {
      package: null,
      createdAt: dayjs().format('YYYY-MM-DDTHH:mm:ssZ'),
      locationDocId: null,
      description: '',
      acceptResponses: true,
      linkId: link,
      customAnswers: [],
      deletedAt: null,
    },
    validate: {
      package: (value) => (!value ? 'Package is required' : null),
      locationDocId: (value) => (!value ? 'Location is required' : null),
      description: (value) =>
        value === '' || !value ? 'Description is required' : null,
    },
  });

  type CustomAnswer = {
    description: string;
    key: string;
    label: string;
    title: string;
  };
  const parsedPackage = useMemo(() => {
    if (form.values?.package) {
      const parsedPackage = JSON.parse(form.values?.package);
      if (
        !parsedPackage?.survey?.customAnswers ||
        !parsedPackage?.survey?.customAnswers?.length
      ) {
        return false;
      }
      let payload: any = {};

      parsedPackage?.survey?.customAnswers?.forEach((ans: CustomAnswer) => {
        payload[`${ans?.key}`] = {
          description: ans?.description,
          key: ans?.key,
          label: ans?.label,
          title: ans?.title,
        };
      });

      Object.keys(payload).forEach((key) => {
        form.setFieldValue(`${key}-customAnswers`, [
          { answer: '', key: nanoid() },
        ]);
      });
      return payload;
    }
  }, [form.values?.package]);

  // const fields = Object.keys(form.values)
  //   ?.filter((key) => key.includes('-customAnswers'))
  //   ?.map((key: any) => {
  //     return (
  //       <Stack key={nanoid()} mt="xs">
  //         <Text size="sm" color="dimmed">
  //           {parsedPackage[key]?.label}: {parsedPackage[key]?.description}
  //         </Text>
  //         {form.values?.[key]?.map((item, i) => {
  //           console.log(form.getInputProps(`${key}.${i}.answer`));
  //           return (
  //             <Group key={item.key} mt="xs">
  //               <TextInput
  //                 placeholder="Answer..."
  //                 sx={{ flex: 1 }}
  //                 {...form.getInputProps(`${key}.${i}.answer`)}
  //               />

  //               <ActionIcon
  //                 color="red"
  //                 onClick={() => form.removeListItem(`${key}`, i)}
  //               >
  //                 <IconTrash size={16} />
  //               </ActionIcon>
  //             </Group>
  //           );
  //         })}
  //         <Button
  //           variant="light"
  //           onClick={() =>
  //             form.insertListItem(`${key}`, {
  //               answer: '',
  //               key: nanoid(),
  //             })
  //           }
  //         >
  //           Add Email
  //         </Button>
  //       </Stack>
  //     );
  //   });

  const fields = (
    <>
      <Text>{parsedPackage?.['area']?.label}</Text>
      <Text size="sm" color="dimmed">
        {parsedPackage?.['area']?.description}
      </Text>
      {/* @ts-ignore */}
      {form?.values?.['area-customAnswers']?.map((item, index) => (
        <Stack key={item.key} mt="xs">
          <Group>
            <TextInput
              placeholder="Answer..."
              sx={{ flex: 1 }}
              radius={'md'}
              size="md"
              {...form.getInputProps(`area-customAnswers.${index}.answer`)}
            />

            <ActionIcon
              color="red"
              onClick={() => form.removeListItem('area-customAnswers', index)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Stack>
      ))}
      <Center
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        mt={'xl'}
      >
        {parsedPackage && (
          <Button
            style={{ maxWidth: '576px' }}
            fullWidth
            radius={'md'}
            variant="light"
            onClick={() =>
              form.insertListItem('area-customAnswers', {
                answer: '',
                key: nanoid(),
              })
            }
          >
            Add Answer
          </Button>
        )}
      </Center>
    </>
  );

  const createLink = async (values: any) => {
    setLoading(true);
    try {
      const parsedPackage = JSON.parse(values.package);
      let payload = {
        ...values,
        package: {
          ...parsedPackage,
          survey: {
            ...parsedPackage?.survey,
            customAnswers: {
              area: values['area-customAnswers']?.map(
                (ans: { answer: string; key: string }) => ans.answer
              ),
            },
          },
        },
      };
      delete payload['area-customAnswers'];
      await addDoc(collection(db, `mines/${mine?.mineId}/links`), payload);
      queryClient.invalidateQueries(['links']);
      setLoading(false);
      showNotification({
        message: 'Successfully created link',
        icon: <IconCheck size={18} />,
      });
      naviagte({ to: `./send` });
    } catch (error: any) {
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        message: error?.message || 'Unable to create link',
      });
      setLoading(false);
    }
  };

  return (
    <>
      <Link to="/surveys">
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
              <Text weight={700}>Create New Link </Text>
              <Text size="xs" color="dimmed">
                Click here to go back
              </Text>
            </div>
          </Group>
        </UnstyledButton>
      </Link>
      <form onSubmit={form.onSubmit(createLink)}>
        <Grid gutter={'xl'}>
          <Grid.Col span={6}>
            <Select
              disabled={isLoading}
              data={
                locations
                  ?.filter((x) =>
                    !user?.isAdmin ? user?.locationAdmin?.includes(x?.id) : true
                  )
                  ?.map((location: { id: any; name: any }) => ({
                    value: location.id,
                    label: location.name,
                  })) ?? []
              }
              placeholder="Select Operation"
              radius={'md'}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Operation
                </Text>
              }
              {...form.getInputProps('locationDocId')}
            />
            <Select
              mt={'xl'}
              disabled={fetching}
              data={
                fetching
                  ? []
                  : mine?.packages?.map((pack) => ({
                      value: JSON.stringify(pack),
                      label: pack?.name,
                    }))
              }
              placeholder="Select Package"
              radius={'md'}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Work Package
                </Text>
              }
              {...form.getInputProps('package')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Textarea
              placeholder="Description"
              radius={'md'}
              autosize
              minRows={5}
              label={
                <Text size="sm" color="dimmed">
                  Description
                </Text>
              }
              {...form.getInputProps('description')}
            />
          </Grid.Col>
          {parsedPackage && <Grid.Col span={12}>{fields}</Grid.Col>}
        </Grid>
        <Center
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          mt={'xl'}
        >
          <Button
            disabled={loading || fetching}
            loading={loading || fetching}
            type="submit"
            style={{ maxWidth: '576px' }}
            fullWidth
            radius={'md'}
          >
            Create Link
          </Button>
        </Center>
      </form>
    </>
  );
};
