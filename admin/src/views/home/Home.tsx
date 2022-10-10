import {
  BackgroundImage,
  Box,
  Button,
  Center,
  Divider,
  Grid,
  Group,
  Image,
  List,
  Paper,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconLocation, IconMapPin } from '@tabler/icons';
import React, { useEffect } from 'react';
import { userGetMine } from '../../context/AuthenticationContext';
import { useGetLocations } from '../../hooks/network/useLocations';
import { useGetMine } from '../../hooks/network/useMine';

export const Home = (): JSX.Element => {
  const PAGE_TITLE = 'Home';

  const { data: locations } = useGetLocations();
  const { data: mine, isLoading } = useGetMine();
  const [_, setTitle] = useLocalStorage({
    key: 'title',
  });
  useEffect(() => {
    setTitle(PAGE_TITLE);
  }, []);

  return (
    <Skeleton visible={isLoading} p="xl">
      <Box
        sx={(theme) => ({
          marginBottom: '4rem',
          width: '100%',
          height: '35vh',
          position: 'relative',
        })}
      >
        <BackgroundImage
          component={Group}
          sx={(theme) => ({
            height: '100%',
            position: 'relative',
          })}
          radius="lg"
          src={mine?.featureImageUrl || ''}
        >
          <Center
            component={Box}
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: '-2rem',
              width: '85%',
            }}
          >
            <Group style={{ width: '100%' }} position="apart">
              <Group spacing={'lg'}>
                <Paper p={'sm'} radius={'lg'} shadow={'xl'}>
                  <Image
                    fit="contain"
                    height={180}
                    width={180}
                    radius={'lg'}
                    src={mine?.imageUrl}
                  />
                </Paper>

                <Stack spacing={'xs'}>
                  <Title color={'white'} order={3}>
                    {mine?.name}
                  </Title>
                  <Group>
                    <IconMapPin color={'white'} />
                    <Text color={'white'}>{mine?.address}</Text>
                  </Group>
                </Stack>
              </Group>

              <Group>{/* <Button>+ New Operation</Button> */}</Group>
            </Group>
          </Center>
        </BackgroundImage>
      </Box>
      <Grid mt={'xl'}>
        <Grid.Col span={4}>
          <Paper p={'xl'}>
            <Text size={'lg'} weight={'bolder'}>
              Description
            </Text>
            <Divider mt={'sm'} mb={'lg'} />
            <Text size={'sm'}>{mine?.description}</Text>
          </Paper>
        </Grid.Col>
        <Grid.Col span={8}>
          <Paper p={'xl'}>
            <Text size={'lg'} weight={'bolder'}>
              Operations
            </Text>
            <Divider mt={'sm'} mb={'lg'} />
            <List spacing="xs" size="sm" center>
              {locations?.map((location) => (
                <List.Item key={location.id}>{location.name}</List.Item>
              ))}
            </List>
          </Paper>
        </Grid.Col>
      </Grid>
    </Skeleton>
  );
};
