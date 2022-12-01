import {
  Accordion,
  ActionIcon,
  Avatar,
  Box,
  Card,
  Divider,
  Group,
  Menu,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { IconDots, IconFileZip, IconTable } from '@tabler/icons';
import { useGetLinkResponses } from '../../hooks/network/useLinks';
import { ILink, IPackage } from '../../types';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import dayjs from 'dayjs';
import { useLocalStorage } from '@mantine/hooks';
import { useEffect, useMemo } from 'react';
import { Link } from '@tanstack/react-location';
import { userGetMine } from '../../context/AuthenticationContext';
import { useGetLocations } from '../../hooks/network/useLocations';

export const SurveyReports = (): JSX.Element => {
  const { data: links } = useGetLinkResponses();
  const { mine, fetching } = userGetMine();
  const { data: locations, isLoading } = useGetLocations();

  const toSentenceCase = (string: string) => {
    const result = string.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  };
  const titleCaseKeys = (object: any) => {
    return Object.entries(object).reduce((carry, [key, value]) => {
      //@ts-ignore
      carry[toSentenceCase(key)] = value;

      return carry;
    }, {});
  };

  const linksByLocation = useMemo(() => {
    if (!fetching && !isLoading) {
      return locations?.map((location) => {
        return {
          ...location,
          links: links?.filter((x) => x.locationDocId === location.id),
        };
      });
    } else return [];
  }, [fetching, isLoading]);

  const downloadResponses = (link: ILink) => {
    const payload = link.responses?.map((res) => {
      return titleCaseKeys(res);
    });
    const ws = XLSX.utils.json_to_sheet(payload || []);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'csv', type: 'array' });
    const data = new window.Blob([excelBuffer], { type: '.csv' });
    //@ts-ignore
    FileSaver.saveAs(data, `${link?.package?.name || 'Survey report'}.csv`);
  };
  const PAGE_TITLE = 'Survey Reports';
  const [_, setTitle] = useLocalStorage({
    key: 'title',
  });
  useEffect(() => {
    setTitle(PAGE_TITLE);
  }, []);
  return (
    <Accordion multiple={true}>
      {linksByLocation?.map((location) => (
        <Accordion.Item key={location.id} value={location.id}>
          <Accordion.Control>
            {location.name} ({location.links?.length ?? 0})
          </Accordion.Control>
          <Accordion.Panel>
            <SimpleGrid
              cols={3}
              spacing="lg"
              breakpoints={[
                { maxWidth: 'md', cols: 1, spacing: 'sm' },
                { maxWidth: 'lg', cols: 2, spacing: 'lg' },
              ]}
            >
              {location.links?.map((link) => (
                <Card
                  key={link.docId}
                  shadow="sm"
                  p="lg"
                  radius="lg"
                  withBorder
                >
                  <Card.Section withBorder inheritPadding py="xs">
                    <Group position="apart">
                      <Box
                        component={Link}
                        to={`./${link.docId}`}
                        sx={{ width: '85%', display: 'flex', gap: '1rem' }}
                      >
                        <Avatar color={'green'} radius={'xl'}>
                          <IconTable />
                        </Avatar>
                        <div style={{ flex: 1 }}>
                          <Text lineClamp={1} size="sm" weight={500}>
                            {/* @ts-ignore */}
                            {link.package.name}
                          </Text>

                          <Text lineClamp={1} color="dimmed" size="xs">
                            {dayjs(link.createdAt).format('DD/MM/YYYY')}
                          </Text>
                        </div>
                      </Box>

                      <Menu withinPortal position="bottom-end" shadow="sm">
                        <Menu.Target>
                          <ActionIcon>
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Item
                            onClick={() => downloadResponses(link)}
                            icon={<IconFileZip size={14} />}
                          >
                            Download
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Card.Section>
                  <Card.Section p="xl" component={Link} to={`./${link.docId}`}>
                    <Text color="dimmed" size="xs">
                      {link?.responses?.length} Response
                      {link?.responses?.length === 1 ? '' : 's'}
                    </Text>
                    <Divider my={'sm'} />
                    <Text color="dimmed" size="xs">
                      {link?.description}
                    </Text>
                    {import.meta.env.DEV && (
                      <>
                        <Divider my={'sm'} />
                        <Text color="dimmed" size="xs">
                          {/* @ts-ignore */}
                          {link?.package?.survey?.key}
                        </Text>
                      </>
                    )}
                  </Card.Section>
                </Card>
              ))}
            </SimpleGrid>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};
