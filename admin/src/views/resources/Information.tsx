import { Button, Chip, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconCirclePlus } from '@tabler/icons';
import {
  Link,
  MakeGenerics,
  useMatch,
  useNavigate,
  useSearch,
} from '@tanstack/react-location';
import { useCallback, useEffect } from 'react';
import { NoticeCard } from '../../components/NoticeCard';
import { ResourceCard } from '../../components/ResourceCard';
import { userGetMine } from '../../context/AuthenticationContext';
import { useGetInformation } from '../../hooks/network/useInformation';
import { INotice, IResource } from '../../types';

type LocationGenerics = MakeGenerics<{
  Search: {
    filter?: string;
  };
}>;

export const Information = (): JSX.Element => {
  const { data: information } = useGetInformation();
  const { mine, fetching } = userGetMine();

  const { filter } = useSearch<LocationGenerics>();
  const navigate = useNavigate<LocationGenerics>();

  const PAGE_TITLE = 'Resources & Notices';
  const [_, setTitle] = useLocalStorage({
    key: 'title',
  });
  useEffect(() => {
    setTitle(PAGE_TITLE);
  }, []);

  const items = useCallback(() => {
    if (filter?.includes('pack-')) {
      const packId = filter?.split('pack-')[1];
      return information?.filter((item) => item?.packageDocId === packId);
    }

    switch (filter) {
      case 'all':
        return information;
      case 'notice':
      case 'resource':
        return information?.filter((item) => item?.type === filter);
      default:
        return information;
    }
  }, [filter]);

  useEffect(() => {
    if (!filter) {
      navigate({
        // @ts-ignore
        search: (old) => ({
          ...old,
          filter: 'all',
        }),
      });
    }
  }, []);

  return (
    <Stack>
      <Group position="apart">
        <Chip.Group
          value={filter}
          onChange={(val) =>
            navigate({
              // @ts-ignore
              search: (old) => ({
                ...old,
                filter: val,
              }),
            })
          }
          position="center"
        >
          <Chip value="all">All</Chip>
          <Chip value="notice">Notice</Chip>
          <Chip value="resource">Resource</Chip>
          {!fetching &&
            mine &&
            mine?.packages?.map((pack) => (
              <Chip key={pack?.packageId} value={`pack-${pack?.packageId}`}>
                {pack?.name}
              </Chip>
            ))}
        </Chip.Group>
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
        {items()?.map((item: INotice | IResource) => {
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
                packageName={
                  mine?.packages?.find(
                    (x) => x?.packageId === item?.packageDocId
                  )?.name
                }
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
                packageName={
                  mine?.packages?.find(
                    (x) => x?.packageId === item?.packageDocId
                  )?.name
                }
              />
            );
          }
        })}
      </SimpleGrid>
    </Stack>
  );
};
