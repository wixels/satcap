import {
  ActionIcon,
  Avatar,
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
import { ILink } from '../../types';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import dayjs from 'dayjs';
import { useLocalStorage } from '@mantine/hooks';
import { useEffect } from 'react';
import { Link } from '@tanstack/react-location';

export const SurveyReports = (): JSX.Element => {
  const { data: links } = useGetLinkResponses();

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
    <Stack>
      <SimpleGrid
        cols={3}
        spacing="lg"
        breakpoints={[
          { maxWidth: 'md', cols: 1, spacing: 'sm' },
          { maxWidth: 'lg', cols: 2, spacing: 'lg' },
        ]}
      >
        {links?.map((link) => (
          <Card
            key={link.docId}
            component={Link}
            to={`./${link.docId}`}
            shadow="sm"
            p="lg"
            radius="lg"
            withBorder
          >
            <Card.Section withBorder inheritPadding py="xs">
              <Group position="apart">
                <div style={{ width: '85%', display: 'flex', gap: '1rem' }}>
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
                </div>

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
            <Card.Section p="xl">
              <Text color="dimmed" size="xs">
                {link?.responses?.length} Response
                {link?.responses?.length === 1 ? '' : 's'}
              </Text>
              <Divider my={'sm'} />
              <Text color="dimmed" size="xs">
                {link?.description}
              </Text>
            </Card.Section>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
};
