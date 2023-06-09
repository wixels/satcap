import {
  ActionIcon,
  Button,
  Group,
  Input,
  InputBase,
  NumberInput,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconTrash, IconX } from '@tabler/icons';
import { useMatch, useNavigate } from '@tanstack/react-location';
import { addDoc, collection } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { useId, useState } from 'react';
import InputMask from 'react-input-mask';
import db from '../../firebase';

export const SurveySendSms = (): JSX.Element => {
  const id = useId();
  const {
    params: { link },
  } = useMatch();
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      mobiles: [{ mobile: '', key: nanoid() }],
    },
    validate: {
      mobiles: {
        mobile: (value) => {
          return value && value.length === 17 && value !== ''
            ? null
            : 'Invalid Phone Number';
        },
      },
    },
  });

  const naviagte = useNavigate();
  const sendSmsLink = async (values: any) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'messages'), {
        to: values.mobiles?.map((cell: { mobile: string }) =>
          cell.mobile
            .replaceAll(' ', '')
            .replaceAll('(', '')
            .replaceAll(')', '')
            .replaceAll('-', '')
        ),
        body: `Good day, The following link will provide you with the necessary Survey/Checklist access: ${import.meta.env.VITE_USER_URL}/?linkId=${link}`,
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
        message: error?.message || 'Unable to send sms',
      });
      setLoading(false);
    }
  };

  const fields = form.values.mobiles.map((item, index) => (
    <Group key={item.key} mt="xs">
      <InputBase
        withAsterisk
        // hidecontols="true"
        sx={{ flex: 1 }}
        {...form.getInputProps(`mobiles.${index}.mobile`)}
        component={InputMask}
        mask="+27 (99) 9999-999"
      />
      <ActionIcon
        color="red"
        onClick={() => form.removeListItem('mobiles', index)}
      >
        <IconTrash size={16} />
      </ActionIcon>
    </Group>
  ));
  return (
    <form onSubmit={form.onSubmit(sendSmsLink)}>
      {fields}
      <Group position="center" mt="md">
        {/* <Button variant="subtle">Upload CSV</Button> */}
        <Button
          variant="light"
          onClick={() =>
            form.insertListItem('mobiles', {
              mobile: '',
              key: nanoid(),
            })
          }
        >
          Add Mobile Number
        </Button>
        <Button
          type="submit"
          disabled={loading || form.values.mobiles?.length === 0}
          loading={loading}
        >
          Send Links
        </Button>
      </Group>
    </form>
  );
};
