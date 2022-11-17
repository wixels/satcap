import {
  ActionIcon,
  Badge,
  Button,
  Card,
  CheckIcon,
  CopyButton,
  Group,
  Menu,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import {
  IconCirclePlus,
  IconClipboardCheck,
  IconDots,
  IconTrash,
} from '@tabler/icons';
import { Link } from '@tanstack/react-location';
import { nanoid } from 'nanoid';
import { useEffect } from 'react';
import { SurveyCard } from '../../components/SurveyCard';
import { useGetLinks } from '../../hooks/network/useLinks';
import { useNanoId } from '../../hooks/useNanoId';
import { ILink, IPackage } from '../../types';

export const Surveys = (): JSX.Element => {
  const linkId = useNanoId();
  const { data: links } = useGetLinks();

  console.log(links);

  const PAGE_TITLE = 'Surveys';
  const [_, setTitle] = useLocalStorage({
    key: 'title',
  });
  useEffect(() => {
    setTitle(PAGE_TITLE);
  }, []);
  return (
    <>
      <Button
        to={`/surveys/${linkId}`}
        component={Link}
        variant="light"
        leftIcon={<IconCirclePlus />}
        mb={'md'}
      >
        Create New
      </Button>
      <SimpleGrid
        cols={3}
        spacing="lg"
        breakpoints={[
          { maxWidth: 'md', cols: 1, spacing: 'sm' },
          { maxWidth: 'lg', cols: 2, spacing: 'lg' },
        ]}
      >
        {links?.map((link: ILink) => (
          <SurveyCard
            linkId={link?.linkId}
            name={
              Array.isArray(link?.package)
                ? `${link.package
                    ?.map((pack: IPackage) => pack.name)
                    .join(', ')}`
                : link?.package?.name
            }
            title={
              Array.isArray(link?.package)
                ? `${link?.package?.length} Survey(s)`
                : link?.package?.survey?.title
            }
            docId={link?.docId}
            description={link?.description}
            acceptResponses={link.acceptResponses}
            key={nanoid()}
          />
        )) ?? []}
      </SimpleGrid>
    </>
  );
};
