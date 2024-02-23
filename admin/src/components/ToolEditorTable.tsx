// @ts-nocheck
import { useMemo } from 'react';
import {
  ActionIcon,
  Anchor,
  Button,
  Card,
  Checkbox,
  createStyles,
  Group,
  Popover,
  Select,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconEdit,
  IconTrash,
} from '@tabler/icons';
import { usePagination, useRowSelect, useTable } from 'react-table';
import { Link } from '@tanstack/react-location';

type Props = {
  data: any;
};

export const ToolEditorTable: React.FC<Props> = ({ data }) => {
  const useStyles = createStyles((theme) => ({
    td: {
      marginBottom: theme.spacing.lg,
      '&:first-of-type': {
        borderTopLeftRadius: theme.radius.lg,
        borderBottomLeftRadius: theme.radius.lg,
      },
      '&:last-of-type': {
        borderTopRightRadius: theme.radius.lg,
        borderBottomRightRadius: theme.radius.lg,
      },
    },
  }));
  const columns = useMemo(
    () => [
      {
        Header: 'Title',
        accessor: 'title',
      },
      {
        Header: 'Type',
        accessor: 'type',
        Cell: ({ row }) => {
          return (
            <span style={{ textTransform: 'capitalize' }}>
              {row?.values?.type.replace('-', ' ')}
            </span>
          );
        },
      },
      {
        Header: 'Locked',
        accessor: 'isLocked',
        Cell: ({ row }) => {
          return row?.values?.isLocked ? (
            <Checkbox defaultChecked disabled />
          ) : (
            <Checkbox disabled />
          );
        },
      },
      {
        Header: 'Max Answer Count',
        accessor: 'maxAnswerCount',
      },
      {
        Header: 'Answers',
        accessor: 'answers',
        Cell: ({ row }) => {
          const answers = row?.values?.answers;
          if (!answers) return 0;
          return `${answers.length} Answer${answers.length === 1 ? '' : 's'}`;
        },
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    // eslint-disable-next-line no-unused-vars
    state: { pageIndex, pageSize, selectedRowIds },
  } = useTable(
    {
      columns,
      data,
    },
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        ...columns,
        {
          id: 'delete',
          Cell: (cell) => {
            if (cell.row.original?.isLocked) return null;
            return (
              <Group>
                <ActionIcon
                  component={Link}
                  to={`/`}
                  color="blue"
                  variant="light"
                >
                  <IconEdit size={16} />
                </ActionIcon>
                <Popover
                  width={300}
                  trapFocus
                  position="bottom"
                  withArrow
                  shadow="md"
                >
                  <Popover.Target>
                    <ActionIcon color="red" variant="light">
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Popover.Target>
                  <Popover.Dropdown
                    sx={(theme) => ({
                      background:
                        theme.colorScheme === 'dark'
                          ? theme.colors.dark[7]
                          : theme.white,
                    })}
                  >
                    <Title order={5}>Are you sure you want to delete?</Title>
                    <Text color="dimmed" mb={'xl'}>
                      This action cannot be undone
                    </Text>
                    <Button
                      fullWidth
                      color={'red'}
                      // onClick={() => handleDelete(cell)}
                    >
                      Delete
                    </Button>
                  </Popover.Dropdown>
                </Popover>
              </Group>
            );
          },
        },
      ]);
    }
  );
  const { classes } = useStyles();
  return (
    <>
      {/* <pre>{JSON.stringify(data, null, 3)}</pre> */}
      <Table
        style={{ marginBottom: '60px' }}
        {...getTableProps()}
        verticalSpacing={'md'}
        highlightOnHover
      >
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr key={row.id} {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td
                      key={cell.id}
                      className={classes.td}
                      {...cell.getCellProps()}
                    >
                      {cell.render('Cell')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>
      {/* {data?.length > 10 && (
        <Card
          sx={(theme) => ({
            position: 'absolute',
            zIndex: 100,
            bottom: 0,
            left: 0,
            right: 0,
            boxShadow: theme.shadows.xl,
            display: 'flex',
            justifyContent: 'space-between',
            overflow: 'initial',
          })}
        >
          <Group>
            <Button.Group>
              <Button
                variant="default"
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
              >
                <IconChevronsLeft size={14} />
              </Button>
              <Button
                variant="default"
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
              >
                <IconChevronLeft size={14} />
              </Button>
              <Button
                variant="default"
                onClick={() => nextPage()}
                disabled={!canNextPage}
              >
                <IconChevronRight size={14} />
              </Button>
              <Button
                variant="default"
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
              >
                <IconChevronsRight size={14} />
              </Button>
            </Button.Group>
            <span>
              Page
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>
            </span>
          </Group>

          <Select
            value={pageSize.toString()}
            onChange={(e) => {
              setPageSize(Number(e));
            }}
            dropdownPosition="top"
            data={[
              { value: '10', label: '10' },
              { value: '20', label: '20' },
              { value: '30', label: '30' },
              { value: '40', label: '40' },
              { value: '50', label: '50' },
            ]}
          />
        </Card>
      )} */}
    </>
  );
};
