import {
  Avatar,
  Button,
  Center,
  Grid,
  Group,
  MultiSelect,
  Select,
  Text,
  Textarea,
  UnstyledButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconChevronsLeft, IconX } from '@tabler/icons';
import { Link, useMatch, useNavigate } from '@tanstack/react-location';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { userGetMine } from '../../context/AuthenticationContext';
import db from '../../firebase';

export const SurveyLink = (): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const {
    data: { locations },
    params: { link },
  } = useMatch();

  const form = useForm({
    initialValues: {
      package: null,
      locationDocId: null,
      description: '',
      acceptResponses: true,
      linkId: link,
    },
    validate: {
      package: (value) => (!value?.length ? 'Package is required' : null),
      locationDocId: (value) => (!value ? 'Location is required' : null),
      description: (value) =>
        value === '' || !value ? 'Description is required' : null,
    },
  });

  const naviagte = useNavigate();
  const { mine, fetching } = userGetMine();

  const createLink = async (values: any) => {
    setLoading(true);
    try {
      await addDoc(collection(db, `mines/${mine?.mineId}/links`), {
        ...values,
        package: values.package?.map((pack: any) => JSON.parse(pack)),
      });
      setLoading(false);
      showNotification({
        message: 'Successfully created link',
        icon: <IconCheck size={18} />,
      });
      naviagte({ to: `./send` });
    } catch (error) {
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
              data={locations.map((location) => ({
                value: location.id,
                label: location.name,
              }))}
              placeholder="Select Locations"
              radius={'md'}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Location
                </Text>
              }
              {...form.getInputProps('locationDocId')}
            />
            <MultiSelect
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
                  Package(s)
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
        </Grid>
        <Center mt={'xl'}>
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
