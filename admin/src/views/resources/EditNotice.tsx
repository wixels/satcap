import {
  Anchor,
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
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { useNavigate } from '@tanstack/react-location';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import React, { useState } from 'react';
import { useGetUser, userGetMine } from '../../context/AuthenticationContext';
import db, { storage } from '../../firebase';
import { useGetLocations } from '../../hooks/network/useLocations';
import { useNanoId } from '../../hooks/useNanoId';
import useUploadFile from '../../hooks/useUploadFile';
import { INotice } from '../../types';

export const EditNotice = (notice: INotice) => {
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
      createdAt: dayjs().format('YYYY-MM-DDTHH:mm:ssZ'),
      date: dayjs(notice.date).toDate(),
      description: notice.description,
      packageDocId: notice?.packageDocId,
      title: notice.title,
      visibility: notice.visibility,
      url: null,
      featureImageUrl: null,
    },
  });

  const updateNotice = async (values: any) => {
    setLoading(true);
    try {
      let url, featureImageUrl;
      if (values?.url) {
        const urlRef = ref(
          storage,
          `mines/${mine?.mineId}/resources/${fileId}-${values.url.name}`
        );
        await uploadFile(urlRef, values.url, {
          contentType: values.url?.type,
        });
        url = await getDownloadURL(urlRef);
      }
      if (values?.featureImageUrl) {
        const featureRef = ref(
          storage,
          `mines/${mine?.mineId}/resources/${fileId}-${values.featureImageUrl.name}`
        );
        await uploadFile(featureRef, values.featureImageUrl, {
          contentType: values.featureImageUrl?.type,
        });
        featureImageUrl = await getDownloadURL(featureRef);
      }
      await updateDoc(doc(db, `mines/${mine?.mineId}/notices`, notice.docId), {
        ...values,
        date: dayjs(values?.date).format('YYYY-MM-DDTHH:mm:ssZ'),
        url: values?.url ? url : notice?.url,
        featureImageUrl: values?.featureImageUrl
          ? featureImageUrl
          : notice?.featureImageUrl,
        publishedBy: {
          name: user?.name,
          authUid: user?.authUid,
          email: user?.email,
        },
      });
      setLoading(false);
      showNotification({
        message: 'Successfully edited notice',
        icon: <IconCheck size={18} />,
      });
      queryClient.invalidateQueries(['information']);
      naviagte({ to: `/information` });
    } catch (error: any) {
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        message: error?.message || 'Unable to update notice',
      });
      setLoading(false);
    }
  };
  return (
    <form onSubmit={form.onSubmit(updateNotice)}>
      <Grid gutter={'xl'}>
        <Grid.Col span={12}>
          <FileInput
            placeholder="Your Attachment"
            radius={'md'}
            size="md"
            label={
              <Text size="sm" color="dimmed">
                Attachment (optional) •{' '}
                <Anchor href={notice?.url} target="_blank">
                  Preview
                </Anchor>
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
                Feature Image •{' '}
                <Anchor href={notice?.url} target="_blank">
                  Preview
                </Anchor>
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
            disabled={true}
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
          Update Notice
        </Button>
      </Center>
    </form>
  );
};
