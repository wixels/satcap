import { Card, Divider, SimpleGrid, Text } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { useEffect } from 'react';
import { useGetMine } from '../../hooks/network/useMine';

export const Dashboard = () => {
  // PAGE SETUP
  const PAGE_TITLE = 'Dashboard';
  const [_, setTitle] = useLocalStorage({
    key: 'title',
  });
  useEffect(() => {
    setTitle(PAGE_TITLE);
  }, []);

  // DATA
  const { data: mine, isLoading } = useGetMine();
  console.log('mine::: ', mine);
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
