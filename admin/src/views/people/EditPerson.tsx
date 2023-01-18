import {
  Avatar,
  Button,
  Center,
  Checkbox,
  Grid,
  Group,
  InputBase,
  MultiSelect,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconChevronLeft, IconPhone, IconX } from '@tabler/icons';
import { Link, useMatch, useNavigate } from '@tanstack/react-location';
import { useQueryClient } from '@tanstack/react-query';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import ReactInputMask from 'react-input-mask';
import db from '../../firebase';
import { useGetLocations } from '../../hooks/network/useLocations';
import { useGetPerson } from '../../hooks/network/usePeople';
import { LocationGenerics } from '../../router';
import { IUser } from '../../types';

export const EditPerson = () => {
  const {
    params: { personId },
  } = useMatch<LocationGenerics>();
  const { data: person } = useGetPerson(personId);
  const { data: locations } = useGetLocations();

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: person?.name,
      email: person?.email,
      mobile: person?.mobile,
      jobTitle: person?.jobTitle,
      locationAdmin: person?.locationAdmin,
      isAdmin: person?.isAdmin,
      mineId: window.localStorage.getItem('mineId'),
    },
    validate: {},
  });

  const createPerson = async (values: IUser) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, `mines/${values?.mineId}/users`, personId), {
        ...values,
        mobile: values.mobile
          ? values.mobile
              .replaceAll(' ', '')
              .replaceAll('(', '')
              .replaceAll(')', '')
              .replaceAll('-', '')
          : '',
      });
      queryClient.invalidateQueries(['people']);
      navigate({ to: '/people' });
    } catch (error: any) {
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        message: error?.message || 'Unable to create admin',
      });
      setLoading(false);
    }
  };

  return (
    <>
      <Link to="/people">
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
              <Text weight={700}>Create Admin User</Text>
              <Text size="xs" color="dimmed">
                Click here to go back
              </Text>
            </div>
          </Group>
        </UnstyledButton>
      </Link>
      {/* @ts-ignore */}
      <form onSubmit={form.onSubmit(createPerson)}>
        <Grid>
          <Grid.Col span={12}>
            <TextInput
              placeholder="Full Name..."
              radius={'md'}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Full Name
                </Text>
              }
              {...form.getInputProps('name')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <InputBase
              icon={<IconPhone size={16} />}
              radius={'md'}
              size="md"
              // hidecontols="true"
              placeholder="Mobile..."
              label={
                <Text size="sm" color="dimmed">
                  Mobile Number
                </Text>
              }
              {...form.getInputProps('mobile')}
              component={ReactInputMask}
              mask="+27 (99) 9999-999"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              disabled
              placeholder="Email..."
              radius={'md'}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Email • Not Editable
                </Text>
              }
              type={'email'}
              {...form.getInputProps('email')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              placeholder="Job Title..."
              radius={'md'}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Job Title
                </Text>
              }
              {...form.getInputProps('jobTitle')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <MultiSelect
              data={
                locations?.map((location: { id: any; name: any }) => ({
                  value: location.id,
                  label: location.name,
                })) ?? []
              }
              placeholder="Select Locations"
              radius={'md'}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Operations this user manages
                </Text>
              }
              {...form.getInputProps('locationAdmin')}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Checkbox
              radius={'md'}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Admin
                </Text>
              }
              {...form.getInputProps('isAdmin')}
            />
          </Grid.Col>
        </Grid>
        <Center mt={'xl'}>
          <Button
            type="submit"
            style={{ maxWidth: '576px' }}
            fullWidth
            radius={'md'}
            loading={loading}
            disabled={loading}
          >
            Update Admin
          </Button>
        </Center>
      </form>
    </>
  );
};
