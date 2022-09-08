/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ActionIcon,
  Button,
  Card,
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
  IconTrash,
} from '@tabler/icons';
import { useNavigate } from '@tanstack/react-location';
import { useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import { useTable, usePagination, useRowSelect } from 'react-table';
import { deleteDoc, doc } from 'firebase/firestore';
import db from '../firebase';

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

export const PeopleTable = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Mobile',
        accessor: 'mobile',
      },
      {
        Header: 'Job Title',
        accessor: 'jobTitle',
      },
      {
        Header: 'Locations',
        accessor: 'locationAdmin',
      },
    ],
    []
  );

  const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
      const defaultRef = React.useRef();
      const resolvedRef = ref != null || defaultRef;

      React.useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate;
      }, [resolvedRef, indeterminate]);

      return (
        <>
          <input type="checkbox" ref={resolvedRef} {...rest} />
        </>
      );
    }
  );
  IndeterminateCheckbox.displayName = 'IndeterminateCheckbox';

  const { classes } = useStyles();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const handleDelete = async (cell) => {
    setLoading(true);
    try {
      // console.log('DOC ID::: ', cell);
      const itemToDelete = cell.data?.[cell?.cell?.row?.index];
      await deleteDoc(
        doc(
          db,
          `mines/${window.localStorage.getItem('mineId')}/users`,
          itemToDelete?.docId
        )
      );
      queryClient.invalidateQueries(['people']);
      setLoading(false);
    } catch (error) {
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        message: error?.message || 'Unable to delete notice',
        disallowClose: true,
      });
      setLoading(false);
    }
  };

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
        {
          id: 'selection',
          Header: ({ getToggleAllPageRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()} />
            </div>
          ),
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
        {
          id: 'delete',
          Cell: (cell) => (
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
                  onClick={() => handleDelete(cell)}
                >
                  Delete
                </Button>
              </Popover.Dropdown>
            </Popover>
          ),
        },
      ]);
    }
  );
  return (
    <>
      <Table
        style={{ marginBottom: '60px' }}
        {...getTableProps()}
        verticalSpacing={'md'}
        highlightOnHover
      >
        {/* <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
            ))}
          </tr>
        ))}
      </thead> */}
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
    </>
  );
};
