import {
  Avatar,
  Button,
  Center,
  Checkbox,
  Grid,
  Group,
  InputBase,
  MultiSelect,
  NumberInput,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconChevronLeft, IconPhone, IconX } from '@tabler/icons';
import { Link, useNavigate } from '@tanstack/react-location';
import { addDoc, collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import ReactInputMask from 'react-input-mask';
import { useGetUser } from '../../context/AuthenticationContext';
import db from '../../firebase';
import { useGetLocations } from '../../hooks/network/useLocations';
import { IUser } from '../../types';

export const CreatePerson = (): JSX.Element => {
  const { user: currentAccount, fetching } = useGetUser();

  const [loading, setLoading] = useState(false);
  const { data: locations, isLoading } = useGetLocations();
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      mobile: '',
      jobTitle: '',
      locationAdmin: [],
      isAdmin: false,
      mineId: window.localStorage.getItem('mineId'),
    },
    validate: {},
  });
  const navigate = useNavigate();
  useEffect(() => {
    if (!fetching && !currentAccount?.isAdmin) navigate({ to: '/' });
  }, [currentAccount?.isAdmin, fetching]);

  const createPerson = async (values: IUser) => {
    setLoading(true);
    try {
      await addDoc(collection(db, `mines/${values?.mineId}/users`), {
        ...values,
        mobile: values.mobile
          ? values.mobile
              .replaceAll(' ', '')
              .replaceAll('(', '')
              .replaceAll(')', '')
              .replaceAll('-', '')
          : '',
      });
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
              placeholder="Email..."
              radius={'md'}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Email
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
              disabled={isLoading}
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
                  Super Admin
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
            Create Admin
          </Button>
        </Center>
      </form>
    </>
  );
};
