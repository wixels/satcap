import {
  Button,
  Center,
  FileInput,
  Grid,
  MultiSelect,
  Select,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DatePicker, DateRangePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useMatch, useNavigate } from '@tanstack/react-location';
import dayjs from 'dayjs';
import { addDoc, collection } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { useState } from 'react';
import { useGetUser, userGetMine } from '../../context/AuthenticationContext';
import db, { storage } from '../../firebase';
import { useNanoId } from '../../hooks/useNanoId';
import useUploadFile from '../../hooks/useUploadFile';

export const CreateNotice = (): JSX.Element => {
  const {
    data: { locations },
  } = useMatch();
  const { mine, fetching } = userGetMine();
  const { user } = useGetUser();
  const fileId = useNanoId();
  const [loading, setLoading] = useState(false);
  const naviagte = useNavigate();
  const [uploadFile] = useUploadFile();
  const form = useForm({
    initialValues: {
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ssZ'),
      date: '',
      description: '',
      packageDocId: '',
      title: '',
      visibility: null,
      url: null,
      featureImageUrl: null,
    },
  });

  const createNotice = async (values: any) => {
    console.log(values);
    setLoading(true);
    try {
      const featureRef = ref(
        storage,
        `mines/${mine?.mineId}/resources/${fileId}-${values.featureImageUrl.name}`
      );
      const urlRef = ref(
        storage,
        `mines/${mine?.mineId}/resources/${fileId}-${values.url.name}`
      );
      await uploadFile(featureRef, values.url, {
        contentType: values.url?.type,
      });
      await uploadFile(urlRef, values.featureImageUrl, {
        contentType: values.featureImageUrl?.type,
      });
      const url = await getDownloadURL(urlRef);
      const featureImageUrl = await getDownloadURL(featureRef);

      await addDoc(collection(db, `mines/${mine?.mineId}/notices`), {
        ...values,
        url,
        featureImageUrl,
        publishedBy: {
          name: user.name,
          authUid: user?.authUid,
          email: user?.email,
        },
      });
      setLoading(false);
      showNotification({
        message: 'Successfully created notice',
        icon: <IconCheck size={18} />,
      });
      naviagte({ to: `/information` });
    } catch (error) {
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        message: error?.message || 'Unable to create notice',
      });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(createNotice)}>
      <Grid gutter={'xl'}>
        <Grid.Col span={12}>
          <FileInput
            placeholder="Image"
            radius={'md'}
            size="md"
            label={
              <Text size="sm" color="dimmed">
                Resource
              </Text>
            }
            {...form.getInputProps('url')}
          />
          <FileInput
            mt={'lg'}
            placeholder="Image"
            radius={'md'}
            size="md"
            label={
              <Text size="sm" color="dimmed">
                Feature Image
              </Text>
            }
            {...form.getInputProps('featureImageUrl')}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            placeholder="Title"
            radius={'md'}
            size="md"
            label={
              <Text size="sm" color="dimmed">
                Title
              </Text>
            }
            {...form.getInputProps('title')}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <DatePicker
            placeholder="Pick Date"
            radius={'md'}
            size="md"
            label={
              <Text size="sm" color="dimmed">
                Date
              </Text>
            }
            {...form.getInputProps('date')}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <MultiSelect
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
            {...form.getInputProps('visibility')}
          />
          <Select
            mt={'xl'}
            disabled={fetching}
            data={
              fetching
                ? []
                : mine?.packages?.map((pack) => ({
                    value: pack.packageDocId,
                    label: pack?.name,
                  }))
            }
            placeholder="Select Package"
            radius={'md'}
            size="md"
            label={
              <Text size="sm" color="dimmed">
                Package
              </Text>
            }
            {...form.getInputProps('packageDocId')}
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
          type="submit"
          style={{ maxWidth: '576px' }}
          fullWidth
          radius={'md'}
          loading={loading}
          disabled={loading}
        >
          Create Notice
        </Button>
      </Center>
    </form>
  );
};
