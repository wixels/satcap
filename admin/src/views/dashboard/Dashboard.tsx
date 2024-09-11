import { AspectRatio, Card, SimpleGrid, Text } from '@mantine/core';
import { Notification } from '@mantine/core';

import { useLocalStorage } from '@mantine/hooks';
import { useEffect } from 'react';
import { useGetMine } from '../../hooks/network/useMine';

export const Dashboard = () => {
  // DATA
  const { data: mine, isLoading } = useGetMine();

  return (
    <>
      <Notification disallowClose mb="xl" title="The dashboard has moved">
        Please view the dashboard on Power BI
      </Notification>
      <AspectRatio ratio={1920 / 1080}>
        <video
          src="https://mandelaminingprecinct.org.za/wp-content/uploads/2024/06/ESG-Impacts-Lens-Dashboard-Overview.mp4"
          controls
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        >
          Your browser does not support the video tag.
        </video>
      </AspectRatio>
      {/* <SimpleGrid
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
      </SimpleGrid> */}
    </>
  );
};
