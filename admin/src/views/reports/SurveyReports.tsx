import {
  Accordion,
  ActionIcon,
  Avatar,
  Box,
  Card,
  Divider,
  Group,
  Menu,
  SimpleGrid,
  Text,
} from '@mantine/core';
import { IconDots, IconFileZip, IconTable } from '@tabler/icons';
import { useGetLinkResponses } from '../../hooks/network/useLinks';
import { ILink } from '../../types';
import dayjs from 'dayjs';
import { useLocalStorage } from '@mantine/hooks';
import { useEffect, useMemo } from 'react';
import { Link } from '@tanstack/react-location';
import { userGetMine } from '../../context/AuthenticationContext';
import { useGetLocations } from '../../hooks/network/useLocations';
import { wordToNum } from '../../utils/wordToNumber';
import { jsonToCsv } from '../../utils/jsonToCsv';
import { collection, getDocs, query, where } from 'firebase/firestore';
import db from '../../firebase';

export const SurveyReports = (): JSX.Element => {
  const { data: links } = useGetLinkResponses();
  const { fetching } = userGetMine();
  const { data: locations, isLoading } = useGetLocations();

  const titleCaseKeys = (object: any) => {
    console.log('object', object);
    // return Object.entries(object).reduce((carry, [key, value]) => {
    //   let newKey = key;

    //   if (key.includes('question')) {
    //     let keyAsNumString = null;
    //     if (key.includes('TwentyFive')) {
    //       let testKey = key
    //         .replace(/([A-Z])/g, ' $1')
    //         .replace('-', ' point')
    //         .split(' ')
    //         .filter((x) => x !== 'question')
    //         .map((x) => x.toLowerCase());

    //       keyAsNumString = wordToNum(
    //         `${testKey?.[0]} ${testKey?.[1]} point ${testKey?.[2]}`
    //       );
    //     } else if (key.includes('FiftyFOur')) {
    //       keyAsNumString = wordToNum('fifty four');
    //     } else {
    //       keyAsNumString = wordToNum(
    //         key
    //           .replace(/([A-Z])/g, ' $1')
    //           .replace('-', ' point')
    //           .split(' ')
    //           .filter((x) => x !== 'question')
    //           .map((x) => x.toLowerCase())
    //           .join(' ')
    //       );
    //     }

    //     keyAsNumString.includes('NaN') ||
    //     !keyAsNumString ||
    //     keyAsNumString === ''
    //       ? (newKey = key)
    //       : (newKey = keyAsNumString);
    //   }
    //   //@ts-ignore
    //   carry[newKey] = value;

    //   return carry;
    // }, {});
  };

  const linksByLocation = useMemo(() => {
    if (!fetching && !isLoading) {
      return locations?.map((location) => {
        return {
          ...location,
          links: links?.filter((x) => x.locationDocId === location.id),
        };
      });
    } else return [];
  }, [fetching, isLoading]);

  const downloadResponses = async (link: ILink) => {
    const q = query(
      collection(db, 'questions'),
      // @ts-ignore
      where('surveyKey', '==', link?.package?.survey?.key)
    );
    let questions: {
      id: string | null;
      answers: {
        id: string | null;
        title: string;
        description: string | null;
      }[];
    }[] = [];
    const qs = await getDocs(q);
    qs.forEach((doc) => {
      // @ts-ignore
      questions.push({ ...doc.data(), id: doc.id });
    });

    let payload = link.responses?.map((response) => {
      let newResponse = {};
      Object.entries(response).forEach(([key, value]) => {
        let foundInQuestion = questions.find(
          // @ts-ignore
          (x) => x?.reportingKey === key || x?.id === key
        );

        if (foundInQuestion) {
          newResponse = {
            ...newResponse,
            // @ts-ignore
            [foundInQuestion?.title]: value,
          };
        } else {
          newResponse = {
            ...newResponse,
            [key]: value,
          };
        }
      });
      return newResponse;
    });

    const { download } = jsonToCsv(
      payload,
      // @ts-ignore
      `${link?.package?.name || 'Survey report'}.csv`
    );
    download();
  };

  return (
    <Accordion multiple={true}>
      {linksByLocation?.map((location) => (
        <Accordion.Item key={location.id} value={location.id}>
          <Accordion.Control>
            {location.name} ({location.links?.length ?? 0})
          </Accordion.Control>
          <Accordion.Panel>
            <SimpleGrid
              cols={3}
              spacing="lg"
              breakpoints={[
                { maxWidth: 'md', cols: 1, spacing: 'sm' },
                { maxWidth: 'lg', cols: 2, spacing: 'lg' },
              ]}
            >
              {location.links
                ?.filter((x) => x?.linkId === '93TRQVNN8k')
                ?.map((link) => (
                  <Card
                    key={link.docId}
                    shadow="sm"
                    p="lg"
                    radius="lg"
                    withBorder
                  >
                    <Card.Section withBorder inheritPadding py="xs">
                      <Group position="apart">
                        <Box
                          component={Link}
                          to={`./${link.docId}`}
                          sx={{ width: '85%', display: 'flex', gap: '1rem' }}
                        >
                          <Avatar color={'green'} radius={'xl'}>
                            <IconTable />
                          </Avatar>
                          <div style={{ flex: 1 }}>
                            <Text lineClamp={1} size="sm" weight={500}>
                              {/* @ts-ignore */}
                              {link.package.name}
                            </Text>

                            <Text lineClamp={1} color="dimmed" size="xs">
                              {dayjs(link.createdAt).format('DD/MM/YYYY')}
                            </Text>
                          </div>
                        </Box>

                        <Menu withinPortal position="bottom-end" shadow="sm">
                          <Menu.Target>
                            <ActionIcon>
                              <IconDots size={16} />
                            </ActionIcon>
                          </Menu.Target>

                          <Menu.Dropdown>
                            <Menu.Item
                              onClick={() => downloadResponses(link)}
                              icon={<IconFileZip size={14} />}
                            >
                              Download
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Card.Section>
                    <Card.Section
                      p="xl"
                      component={Link}
                      to={`./${link.docId}`}
                    >
                      <Text color="dimmed" size="xs">
                        {link?.responses?.length} Response
                        {link?.responses?.length === 1 ? '' : 's'}
                      </Text>
                      <Divider my={'sm'} />
                      <Text color="dimmed" size="xs">
                        {link?.description}
                      </Text>
                      {import.meta.env.DEV && (
                        <>
                          <Divider my={'sm'} />
                          <Text color="dimmed" size="xs">
                            {/* @ts-ignore */}
                            {link?.package?.survey?.key}
                          </Text>
                        </>
                      )}
                    </Card.Section>
                  </Card>
                ))}
            </SimpleGrid>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};
