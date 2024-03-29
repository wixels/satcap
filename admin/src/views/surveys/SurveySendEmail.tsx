import {
  ActionIcon,
  Button,
  FileButton,
  Group,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconTrash, IconX } from '@tabler/icons';
import { useMatch, useNavigate } from '@tanstack/react-location';
import { addDoc, collection } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import db from '../../firebase';

export const SurveySendEmail = (): JSX.Element => {
  const [loading, setLoading] = useState(false);

  const {
    params: { link },
  } = useMatch();
  const form = useForm({
    initialValues: {
      emails: [{ email: '', key: nanoid() }],
    },
    validate: {
      emails: {
        email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      },
    },
  });

  const naviagte = useNavigate();
  const fields = form.values.emails.map((item, index) => (
    <Group key={item.key} mt="xs">
      <TextInput
        placeholder="Email..."
        sx={{ flex: 1 }}
        {...form.getInputProps(`emails.${index}.email`)}
      />

      <ActionIcon
        color="red"
        onClick={() => form.removeListItem('emails', index)}
      >
        <IconTrash size={16} />
      </ActionIcon>
    </Group>
  ));

  const sendEmailLink = async (values: any) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'mail'), {
        to: values.emails?.map(
          (email: { email: string; key: string }) => email.email
        ),
        message: {
          subject: 'No Reply - Survey/Checklist Link',
          text: `Good day, The following link will provide you with the necessary Survey/Checklist access: ${import.meta.env.VITE_USER_URL}/?linkId=${link}`,
          html: `
          <div style="padding:20px;">
            <p>Good day</p>
            <p>The following link will provide you with the necessary Survey/Checklist access:<br><br>
            <strong><a href='${import.meta.env.VITE_USER_URL}/?linkId=${link}'>Survey/Checklist link</a></strong>
            </p>
            <br><br><br><br><br>
            <p style="font-size:.9rem;text-align:center;">This is an automated system email. Please do not reply to this email.</p>
          </div>
          `,
        },
      });
      setLoading(false);
      showNotification({
        message: 'Successfully sent links',
        icon: <IconCheck size={18} />,
      });
      naviagte({ to: '/surveys', replace: true });
    } catch (error: any) {
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        message: error?.message || 'Unable to send emails',
      });
      setLoading(false);
    }
  };

  const addCsvEmails = (file: File) => {
    try {
      if (file) {
        const fileReader = new window.FileReader();
        fileReader.onload = async function (event) {
          const text = event?.target?.result;
          // @ts-ignore
          const arr: string[] = text.split('\r\n');
          arr.pop();
          arr
            .map((string) => ({ email: string, key: nanoid() }))
            .forEach((item) => {
              form.insertListItem('emails', item);
            });
        };
        fileReader.readAsText(file);
      }
    } catch (error) {
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        message: 'Unable to process CSV',
      });
    }
  };
  return (
    <form onSubmit={form.onSubmit(sendEmailLink)}>
      {fields}
      <Group position="center" mt="md">
        <FileButton onChange={addCsvEmails} accept=".csv">
          {(props) => (
            <Button {...props} variant="subtle">
              Upload CSV
            </Button>
          )}
        </FileButton>

        <Button
          variant="light"
          onClick={() =>
            form.insertListItem('emails', {
              email: '',
              key: nanoid(),
            })
          }
        >
          Add Email
        </Button>
        <Button
          type="submit"
          disabled={loading || form.values.emails?.length === 0}
          loading={loading}
        >
          Send Links
        </Button>
      </Group>
    </form>
  );
};
