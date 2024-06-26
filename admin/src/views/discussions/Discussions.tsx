import {
  Avatar,
  Button,
  Divider,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconAssembly, IconDownload } from '@tabler/icons';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { DiscussionButton } from '../../components/DiscussionButton';
import { QueryCard } from '../../components/QueryCard';
import { StatsGroup } from '../../components/StatsGroup';
import { useGetDiscussions } from '../../hooks/network/useDiscussions';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { IDiscussion } from '../../types';
import { jsonToCsv } from '../../utils/jsonToCsv';
dayjs.extend(localizedFormat);

const Discussions = () => {
  const { data: discussions, isLoading, isError } = useGetDiscussions();

  const [active, setActve] = useState<'Total' | 'Open' | 'Archived'>('Open');

  const stats = useMemo(() => {
    if (discussions && !isLoading && !isError) {
      return [
        {
          title: 'Open',
          caption: `${
            discussions?.filter((x) => x?.status === 'open').length
          } Open`,
          icon: <IconAssembly size={16} />,
        },
        {
          title: 'Resolved',
          caption: `${
            discussions?.filter((x) => x?.status === 'resolved').length
          } in total`,
          icon: <IconAssembly size={16} />,
        },
        {
          title: 'Archived',
          caption: `${
            discussions?.filter((x) => x?.status === 'archived').length
          } Archived`,
          icon: <IconAssembly size={16} />,
        },
      ];
    }
  }, [discussions, isLoading, isError]);

  const toSentenceCase = (string: string) => {
    const result = string.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  };
  const titleCaseKeys = (object: any) => {
    return Object.entries(object).reduce((carry, [key, value]) => {
      //@ts-ignore
      carry[toSentenceCase(key)] = value;

      return carry;
    }, {});
  };
  const downloadReport = (queries: IDiscussion[]) => {
    const { download } = jsonToCsv(
      queries,
      // @ts-ignore
      'Queries.csv'
    );
    download();
  };
  return (
    <>
      <Grid>
        <Grid.Col mt={'xl'} span={2}>
          <Stack>
            {stats?.map((stat) => (
              <DiscussionButton
                key={stat?.title}
                {...stat}
                active={active === stat?.title}
                // @ts-ignore
                onClick={setActve}
              />
            ))}
            <Button
              onClick={() => downloadReport(discussions ?? [])}
              leftIcon={<IconDownload />}
            >
              Download Report
            </Button>
          </Stack>
        </Grid.Col>
        <Grid.Col span={10}>
          <SimpleGrid
            mt={'xl'}
            cols={3}
            spacing="lg"
            breakpoints={[
              { maxWidth: 'md', cols: 1, spacing: 'sm' },
              { maxWidth: 'lg', cols: 2, spacing: 'lg' },
            ]}
          >
            {discussions
              ?.filter((x) => x?.status === active.toLowerCase())
              .map((item) => (
                <QueryCard
                  docId={item.docId}
                  key={item.docId}
                  image={item?.image}
                  status={item.status}
                  title={item.title}
                  name={item?.name}
                  date={
                    item.createdAt ? dayjs(item.createdAt).format('LL') : ''
                  }
                  description={item.description}
                />
              ))}
          </SimpleGrid>
        </Grid.Col>
      </Grid>
    </>
  );
};

export { Discussions };
