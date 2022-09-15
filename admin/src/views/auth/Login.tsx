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
    display: 'flex',
    justifyContent: 'flex-end',
    minHeight: 900,
    height: '100vh',
    backgroundSize: 'cover',
    backgroundImage:
      'url(https://firebasestorage.googleapis.com/v0/b/satcap-research.appspot.com/o/public%2Fauth-bg.png?alt=media&token=d5488eea-b5eb-443d-b188-a650c719db0e)',
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
    width: '45vw',
    paddingTop: 80,

    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      width: '100%',
    },
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
          <Image
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: '2rem',
            }}
            width={180}
            radius="md"
            src={'https://satcap-research.web.app/_style/images/logo.png'}
            alt="Random unsplash image"
          />
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
    </>
  );
};
