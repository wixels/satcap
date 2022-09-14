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
import { DatePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useMatch, useNavigate } from '@tanstack/react-location';
import dayjs from 'dayjs';
import { useGetUser, userGetMine } from '../../context/AuthenticationContext';
import useUploadFile from '../../hooks/useUploadFile';
import { getDownloadURL, ref } from 'firebase/storage';
import db, { storage } from '../../firebase';
import { useNanoId } from '../../hooks/useNanoId';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { ILocation } from '../../types';
import { useGetLocations } from '../../hooks/network/useLocations';
import { useQueryClient } from '@tanstack/react-query';

export const CreateResource = (): JSX.Element => {
  const { data: locations, isLoading } = useGetLocations();
  const { mine, fetching } = userGetMine();
  const { user } = useGetUser();
  const fileId = useNanoId();
  const [loading, setLoading] = useState(false);
  const naviagte = useNavigate();
  const queryClient = useQueryClient();
  const [uploadFile] = useUploadFile();

  const form = useForm({
    initialValues: {
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ssZ'),
      description: '',
      packageDocId: '',
      title: '',
      visibility: null,
      url: null,
      featureImageUrl: null,
    },
  });

  const createResource = async (values: any) => {
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
      await uploadFile(urlRef, values.url, {
        contentType: values.url?.type,
      });
      await uploadFile(featureRef, values.featureImageUrl, {
        contentType: values.featureImageUrl?.type,
      });
      const url = await getDownloadURL(urlRef);
      const featureImageUrl = await getDownloadURL(featureRef);

      await addDoc(collection(db, `mines/${mine?.mineId}/resources`), {
        ...values,
        url,
        featureImageUrl,
        publishedBy: {
          name: user?.name,
          authUid: user?.authUid,
          email: user?.email,
        },
      });
      setLoading(false);
      showNotification({
        message: 'Successfully created resource',
        icon: <IconCheck size={18} />,
      });
      queryClient.invalidateQueries(['information']);
      naviagte({ to: `/information` });
    } catch (error: any) {
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        message: error?.message || 'Unable to create resource',
      });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(createResource)}>
      <Grid gutter={'xl'}>
        <Grid.Col span={12}>
          <FileInput
            placeholder="Image"
            radius={'md'}
            size="md"
            label={
              <Text size="sm" color="dimmed">
                Your File
              </Text>
            }
            {...form.getInputProps('url')}
          />
          <FileInput
            mt={'lg'}
            placeholder="Image"
            radius={'md'}
            size="md"
            accept="image/*"
            label={
              <Text size="sm" color="dimmed">
                Feature Image
              </Text>
            }
            {...form.getInputProps('featureImageUrl')}
          />
        </Grid.Col>
        <Grid.Col span={12}>
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
          Create Resource
        </Button>
      </Center>
    </form>
  );
};
