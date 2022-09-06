import { ActionIcon, Button, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconTrash, IconX } from '@tabler/icons';
import { useMatch, useNavigate } from '@tanstack/react-location';
import { addDoc, collection } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import React, { useState } from 'react';
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
        to: values.emails?.map((email) => email.email),
        message: {
          subject: 'SATCAP | Complete our survey',
          text: `Hi there! Please complete our survey at https://satcap-research.web.app/?linkId=${link}`,
          html: `<p>Hi there!</p><p>Please complete our survey at <a href='https://satcap-research.web.app/?linkId=${link}'>https://satcap-research.web.app/?linkId=${link}</a></p>`,
        },
      });
      setLoading(false);
      showNotification({
        message: 'Successfully sent links',
        icon: <IconCheck size={18} />,
      });
      naviagte({ to: '/surveys', replace: true });
    } catch (error) {
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        message: error?.message || 'Unable to send emails',
      });
      setLoading(false);
    }
  };
  return (
    <form onSubmit={form.onSubmit(sendEmailLink)}>
      {fields}
      <Group position="center" mt="md">
        <Button variant="subtle">Upload CSV</Button>
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
        <Button type="submit" disabled={loading} loading={loading}>
          Send Links
        </Button>
      </Group>
    </form>
  );
};
