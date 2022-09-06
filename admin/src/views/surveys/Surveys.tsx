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
import {
  IconCirclePlus,
  IconClipboardCheck,
  IconDots,
  IconTrash,
} from '@tabler/icons';
import { Link, useMatch } from '@tanstack/react-location';
import { SurveyCard } from '../../components/SurveyCard';
import { useNanoId } from '../../hooks/useNanoId';

export const Surveys = (): JSX.Element => {
  const linkId = useNanoId();
  const {
    data: { links },
  } = useMatch();

  console.log(links);
  return (
    <Stack>
      <Group mb={'1rem'} position="apart">
        <Text weight={700} size={'lg'}>
          Surveys
        </Text>
        <Link to={`/surveys/${linkId}`}>
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
        {links.map((link) => (
          <SurveyCard
            linkId={link?.linkId}
            name={
              Array.isArray(link?.package)
                ? `${link.package?.map((pack) => pack.name).join(', ')}`
                : link?.package?.name
            }
            title={
              Array.isArray(link?.package)
                ? `${link?.package?.length} Survey(s)`
                : link?.package?.survey?.title
            }
            docId={link?.docId}
            description={link?.description}
            key={link.linkId}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
};
