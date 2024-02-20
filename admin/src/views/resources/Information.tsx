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
import { useCallback, useEffect, useState } from 'react';
import { NoticeCard } from '../../components/NoticeCard';
import { ResourceCard } from '../../components/ResourceCard';
import { userGetMine } from '../../context/AuthenticationContext';
import { useGetInformation } from '../../hooks/network/useInformation';
import { INotice, IResource } from '../../types';

type LocationGenerics = MakeGenerics<{
  Search: {
    filter?: string[];
  };
}>;

export const Information = (): JSX.Element => {
  const { data: information } = useGetInformation();
  const { mine, fetching } = userGetMine();

  const { filter } = useSearch<LocationGenerics>();
  const navigate = useNavigate<LocationGenerics>();

  const [chips, setChips] = useState(filter);

  const items = useCallback(() => {
    if (filter?.includes('all') || !filter?.length || !filter)
      return information;
    const packs = filter?.map(
      (string) => string.includes('pack-') && string.split('pack-')[1]
    );
    let source = [...(information || [])];
    let filtered: any[] = [];
    information?.forEach((inf, i) => {
      packs?.forEach((pack) => {
        if (inf.packageDocId === pack) {
          source.splice(i, 1);
          filtered.push(inf);
        }
      });
    });
    filter?.forEach((string) => {
      switch (string) {
        case 'notice':
        case 'resource':
          {
            filtered = [
              ...filtered,
              ...source?.filter((item) => item?.type === string),
            ];
          }
          break;
        default:
          return information;
      }
    });

    return filtered;
  }, [filter, information]);

  return (
    <Stack>
      <Group position="apart">
        <Chip.Group
          value={chips}
          position="center"
          multiple
          onChange={(val) => {
            if (val.includes('all')) {
              if (val?.indexOf('all') === 0 && val.length > 0) {
                setChips(val.slice(1));
                navigate({
                  // @ts-ignore
                  search: (old) => ({
                    ...old,
                    filter: val.slice(1),
                  }),
                });
              } else {
                setChips(['all']);
                navigate({
                  // @ts-ignore
                  search: (old) => ({
                    ...old,
                    filter: 'all',
                  }),
                });
              }
            } else {
              setChips(val);
              navigate({
                // @ts-ignore
                search: (old) => ({
                  ...old,
                  filter: val,
                }),
              });
            }
          }}
        >
          <Chip value="all">All</Chip>
          <Chip value="notice">Notice</Chip>
          <Chip value="resource">Resource</Chip>
          {!fetching &&
            mine &&
            mine?.packages?.map((pack) => (
              <Chip key={pack?.docId} value={`pack-${pack?.docId}`}>
                {pack?.name}
              </Chip>
            ))}
        </Chip.Group>
        {/* <Chip.Group
          value={filter}
          multiple
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
              <Chip key={pack?.docId} value={`pack-${pack?.docId}`}>
                {pack?.name}
              </Chip>
            ))}
        </Chip.Group> */}
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
                  mine?.packages?.find((x) => x?.docId === item?.packageDocId)
                    ?.name
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
                  mine?.packages?.find((x) => x?.docId === item?.packageDocId)
                    ?.name
                }
              />
            );
          }
        })}
      </SimpleGrid>
    </Stack>
  );
};
