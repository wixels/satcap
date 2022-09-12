import {
  Anchor,
  Button,
  Card,
  Center,
  Checkbox,
  createStyles,
  Grid,
  Group,
  Image,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
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

const useStyles = createStyles((theme) => ({
  wrapper: {
    minHeight: 900,
    height: '100vh',
    backgroundSize: 'cover',
    backgroundImage:
      'url(https://images.unsplash.com/photo-1484242857719-4b9144542727?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1280&q=80)',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    borderRight: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[3]
    }`,
    minHeight: 900,
    height: '100vh',
    maxWidth: 450,
    paddingTop: 80,

    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      maxWidth: '100%',
    },
  },

  title: {
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },

  logo: {
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    width: 120,
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}));

export const Login = (): JSX.Element => {
  const { classes } = useStyles();
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
    <>
      <div className={classes.wrapper}>
        <Paper
          component="form"
          onSubmit={form.onSubmit(handleSubmit)}
          className={classes.form}
          radius={0}
          p={30}
        >
          <Title
            order={2}
            className={classes.title}
            align="center"
            mt="md"
            mb={50}
          >
            Welcome back to SATCAP!
          </Title>

          <TextInput
            radius={'md'}
            size="md"
            placeholder="hello@gmail.com"
            label={
              <Text size="sm" color="dimmed">
                Email address
              </Text>
            }
            {...form.getInputProps('email')}
          />
          <PasswordInput
            mt="md"
            radius={'md'}
            size="md"
            label={
              <Text size="sm" color="dimmed">
                Your password
              </Text>
            }
            {...form.getInputProps('password')}
          />
          {/* <Checkbox label="Keep me logged in§" mt="xl" size="sm" /> */}
          <Button
            loading={loading}
            disabled={loading}
            type="submit"
            mt="xl"
            radius={'md'}
            fullWidth
          >
            Sign In
          </Button>
        </Paper>
      </div>
      {/* <form onSubmit={form.onSubmit(handleSubmit)}>
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
        <Button loading={loading} type="submit" mt="xl" radius={'md'} fullWidth>
          Sign In
        </Button>
      </form> */}
    </>
  );
};
