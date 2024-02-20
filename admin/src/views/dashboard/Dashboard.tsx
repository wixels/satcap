import { Card, SimpleGrid, Text } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { useEffect } from 'react';
import { useGetMine } from '../../hooks/network/useMine';

export const Dashboard = () => {

  // DATA
  const { data: mine, isLoading } = useGetMine();

  return (
    <>
      <SimpleGrid
        cols={3}
        spacing="lg"
        breakpoints={[
          { maxWidth: 'md', cols: 1, spacing: 'sm' },
          { maxWidth: 'lg', cols: 2, spacing: 'lg' },
        ]}
      >
        {mine?.packages?.map((pack, i) => (
          <Card
            key={pack.docId}
            component="a"
            href={`/dashboard/${pack.survey.key}`}
            shadow="sm"
            p="lg"
            radius="md"
            withBorder
          >
            <Card.Section withBorder inheritPadding py="xs">
              <Text weight={500}>{pack.name}</Text>
            </Card.Section>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
};
