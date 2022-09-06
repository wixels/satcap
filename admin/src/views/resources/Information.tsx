import { Button, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconCirclePlus, IconDots, IconTrash } from '@tabler/icons';
import { Link, useMatch } from '@tanstack/react-location';
import { NoticeCard } from '../../components/NoticeCard';
import { ResourceCard } from '../../components/ResourceCard';

export const Information = (): JSX.Element => {
  const {
    data: { information },
  } = useMatch();

  console.log(information);
  return (
    <Stack>
      <Group mb={'1rem'} position="apart">
        <Text weight={700} size={'lg'}>
          Resources & Notices
        </Text>
        <Link to={'/information/create/resource'}>
          <Button variant="light" leftIcon={<IconCirclePlus />}>
            Create New
          </Button>
        </Link>
      </Group>

      <SimpleGrid
        cols={3}
        spacing="lg"
        breakpoints={[
          { maxWidth: 'md', cols: 1, spacing: 'sm' },
          { maxWidth: 'lg', cols: 2, spacing: 'lg' },
        ]}
      >
        {information.map((item) => {
          if (item.type === 'resource') {
            return (
              <ResourceCard
                key={`${item.title}-${item.packageDocId}`}
                title={item.title}
                content={item.description}
                imageUrl={item.url}
                publisher={item?.publishedBy?.name}
              />
            );
          } else if (item.type === 'notice') {
            return (
              <NoticeCard
                key={`${item.title}-${item.packageDocId}`}
                title={item.title}
                content={item.description}
                imageUrl={item.url}
                publisher={item?.publishedBy?.name}
              />
            );
          }
        })}
      </SimpleGrid>
    </Stack>
  );
};
