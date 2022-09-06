import {
  Avatar,
  Button,
  Center,
  Grid,
  Group,
  NumberInput,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconChevronLeft, IconPhone } from '@tabler/icons';
import { Link } from '@tanstack/react-location';

export const CreatePerson = (): JSX.Element => {
  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      mobile: '',
      email: '',
      jobTitle: '',
      nameOfMine: '',
      operation: '',
    },
  });
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
      <form>
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              placeholder="First Name..."
              radius={'md'}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  First Name
                </Text>
              }
              {...form.getInputProps('firstName')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              placeholder="Last Name..."
              radius={'md'}
              size="md"
              label={
                <Text size="sm" color="dimmed">
                  Last Name
                </Text>
              }
              {...form.getInputProps('lastName')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              icon={<IconPhone size={16} />}
              radius={'md'}
              size="md"
              hideControls
              placeholder="mobile..."
              label={
                <Text size="sm" color="dimmed">
                  Mobile Number
                </Text>
              }
              {...form.getInputProps('mobile')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              placeholder="email..."
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
              placeholder="jobTitle..."
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
            <TextInput
              placeholder="Operation..."
              label={
                <Text size="sm" color="dimmed">
                  Operation
                </Text>
              }
              radius={'md'}
              size="md"
              {...form.getInputProps('operation')}
            />
          </Grid.Col>
        </Grid>
        <Center mt={'xl'} style={{ width: '100%' }}>
          <Group>
            <Button variant="light">Create Admin</Button>
            <Button>Send Link</Button>
          </Group>
        </Center>
      </form>
    </>
  );
};
