import { Button, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconCirclePlus, IconDots, IconTrash } from '@tabler/icons';
import { Link, useMatch } from '@tanstack/react-location';
import { useEffect } from 'react';
import { NoticeCard } from '../../components/NoticeCard';
import { ResourceCard } from '../../components/ResourceCard';
import { useGetInformation } from '../../hooks/network/useInformation';
import { INotice, IResource } from '../../types';

export const Information = (): JSX.Element => {
  const { data: information } = useGetInformation();
  const PAGE_TITLE = 'Resources & Notices';
  const [_, setTitle] = useLocalStorage({
    key: 'title',
  });
  useEffect(() => {
    setTitle(PAGE_TITLE);
  }, []);
  return (
    <Stack>
      <Link to={'/information/create/resource'}>
        <Button variant="light" leftIcon={<IconCirclePlus />}>
          Create New
        </Button>
      </Link>

      <SimpleGrid
        cols={3}
        spacing="lg"
        breakpoints={[
          { maxWidth: 'md', cols: 1, spacing: 'sm' },
          { maxWidth: 'lg', cols: 2, spacing: 'lg' },
        ]}
      >
        {information?.map((item: INotice | IResource) => {
          if (item.type === 'resource') {
            return (
              <ResourceCard
                key={`${item.title}-${item.packageDocId}`}
                title={item.title}
                content={item.description}
                imageUrl={item.featureImageUrl}
                publisher={item?.publishedBy?.name}
                docId={item.docId}
                visibility={item?.visibility}
              />
            );
          } else if (item.type === 'notice') {
            return (
              <NoticeCard
                key={`${item.title}-${item.packageDocId}`}
                title={item.title}
                content={item.description}
                imageUrl={item.featureImageUrl}
                publisher={item?.publishedBy?.name}
                docId={item.docId}
                visibility={item?.visibility}
              />
            );
          }
        })}
      </SimpleGrid>
    </Stack>
  );
};
