import {
  Button,
  Card,
  Center,
  Checkbox,
  Grid,
  Group,
  Image,
  PasswordInput,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconX } from '@tabler/icons';
import { useNavigate } from '@tanstack/react-location';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { auth } from '../../firebase';

interface FormValues {
  email: string;
  password: string;
}

export const Login = (): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(false);
  const form = useForm<FormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const naviagte = useNavigate();

  const handleSubmit = async (values: FormValues): Promise<void> => {
    setLoading(true);
    await signInWithEmailAndPassword(auth, values.email, values.password)
      .then(() => {
        naviagte({ to: '/people', replace: true });
        setLoading(false);
      })
      .catch((error: any) => {
        showNotification({
          icon: <IconX size={18} />,
          color: 'red',
          message: error.message,
        });
        setLoading(false);
      });
  };

  return (
    <Grid
      sx={(theme) => ({
        width: '100vw',
        height: '100vh',
        backgroundColor: theme.colors.gray[1],
      })}
    >
      <Grid.Col span={6}></Grid.Col>
      <Grid.Col
        span={6}
        p="xl"
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Center my={'xl'}>
          <div style={{ width: 120, marginLeft: 'auto', marginRight: 'auto' }}>
            <Image
              radius="xl"
              src="https://images.unsplash.com/photo-1618556450991-2f1af64e8191?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1064&q=80"
              alt="Random unsplash image"
            />
          </div>
        </Center>
        <Card p={'xl'} radius={'md'} style={{ width: '100%' }}>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Text size={'xl'} weight={700}>
              Sign in to your account
            </Text>
            <TextInput
              pt={'lg'}
              radius={'md'}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Email
                </Text>
              }
              {...form.getInputProps('email')}
            />
            <PasswordInput
              pt={'lg'}
              radius={'md'}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Password
                </Text>
              }
              {...form.getInputProps('password')}
            />
            <Group pt={'xl'} position="apart">
              <Checkbox label="Remember me" />
              <Button variant="white">Forgot Password?</Button>
            </Group>
            <Button
              loading={loading}
              type="submit"
              mt="xl"
              radius={'md'}
              fullWidth
            >
              Sign In
            </Button>
          </form>
        </Card>
      </Grid.Col>
    </Grid>
  );
};
