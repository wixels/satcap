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
import { useGetMine } from '../../hooks/network/useMine';
import { useNanoId } from '../../hooks/useNanoId';
import { ILink, IPackage } from '../../types';
import { ToolCard } from '../../components/ToolCard';

export const Tools = (): JSX.Element => {
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
        {mine?.packages?.map((pack, i) => {
          console.log('pack::: ', pack);
          return (
            <ToolCard
              linkId={pack.survey.key}
              name={pack.name}
              description={pack.scopes.join(', ')}
              docId={pack.docId}
              key={nanoid()}
            />
          );
        })}
      </SimpleGrid>
    </>
  );
};
