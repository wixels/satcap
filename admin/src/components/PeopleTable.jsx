/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ActionIcon,
  Button,
  Card,
  createStyles,
  Group,
  Select,
  Table,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconTrash,
} from '@tabler/icons';
import React, { useMemo } from 'react';
import { useTable, usePagination, useRowSelect } from 'react-table';

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
          Cell: () => (
            <ActionIcon color="red" variant="light">
              <IconTrash size={16} />
            </ActionIcon>
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
