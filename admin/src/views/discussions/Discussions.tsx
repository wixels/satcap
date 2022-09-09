import { Divider, SimpleGrid, Title } from '@mantine/core';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { QueryCard } from '../../components/QueryCard';
import { StatsGroup } from '../../components/StatsGroup';
import { useGetDiscussions } from '../../hooks/network/useDiscussions';

type Props = {};

const Discussions = (props: Props) => {
  const data = [
    {
      title: 'Page views',
      stats: '456,133',
      description:
        '24% more than in the same month last year, 33% more that two years ago',
    },
    {
      title: 'New users',
      stats: '2,175',
      description:
        '13% less compared to last month, new user engagement up by 6%',
    },
    {
      title: 'Completed orders',
      stats: '1,994',
      description:
        '1994 orders were completed this month, 97% satisfaction rate',
    },
  ];

  const { data: discussions, isLoading, isError } = useGetDiscussions();

  const stats = useMemo(() => {
    if (discussions && !isLoading && !isError) {
      return [
        {
          title: 'Total',
          stats: discussions?.filter((x) => x?.status === 'resolved').length,
        },
        {
          title: 'Open',
          stats: discussions?.filter((x) => x?.status === 'open').length,
        },
        {
          title: 'Archived',
          stats: discussions?.filter((x) => x?.status === 'archived').length,
        },
      ];
    }
  }, [discussions, isLoading, isError]);
  return (
    <>
      <StatsGroup data={stats} />
      <Title mt={'xl'} order={2}>
        Discussion Board
      </Title>
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
          ?.filter((x) => x?.status === 'open' || x?.status === 'resolved')
          .map((item) => (
            <QueryCard
              docId={item.docId}
              key={item.docId}
              image={item?.image}
              status={item.status}
              title={item.title}
              author={{
                name: item?.publishedBy?.name,
                description:
                  item.createdAt ?? dayjs(item.createdAt).format('DD/MM/YYYY'),
              }}
            />
          ))}
      </SimpleGrid>
    </>
  );
};

export { Discussions };
