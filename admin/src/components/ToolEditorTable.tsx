// @ts-nocheck
import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  Popover,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { cleanNotifications, showNotification } from '@mantine/notifications';
import { IconEdit, IconTrash, IconX } from '@tabler/icons';
import { Link, useRouter } from '@tanstack/react-location';
import { deleteDoc, doc, writeBatch } from 'firebase/firestore';
import update from 'immutability-helper';
import { useCallback, useMemo, useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { useTable } from 'react-table';
import db from '../firebase';
import useDebouncedCallback from '../hooks/useDebouncedCallback';
import { useQueryClient } from '@tanstack/react-query';

// needed for row & cell level scope DnD setup

type Props = {
  data: any;
  orderLocked: boolean;
};
const Row = ({ row, index, moveRow }) => {
  const dropRef = useRef(null);
  const dragRef = useRef(null);

  const [, drop] = useDrop({
    accept: 'row',
    hover(item, monitor) {
      if (!dropRef.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = dropRef.current.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      moveRow(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    item: { type: 'row', index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;

  preview(drop(dropRef));
  drag(dragRef);

  return (
    <tr ref={dropRef} style={{ opacity }}>
      <td ref={dragRef}>
        <ActionIcon>=</ActionIcon>
      </td>
      {row.cells.map((cell) => {
        return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
      })}
    </tr>
  );
};

export const ToolEditorTable: React.FC<Props> = ({ data, orderLocked }) => {
  const [records, setRecords] = useState(data);

  const router = useRouter();
  const queryClient = useQueryClient();

  const getRowId = useCallback((row) => {
    return row.id;
  }, []);

  const handleDelete = async (docId) => {
    try {
      //
      await deleteDoc(doc(db, 'questions', docId));
      queryClient.invalidateQueries();
      window.location.reload();
    } catch (error) {
      showNotification({
        icon: <IconX size={18} />,
        color: 'red',
        message: 'Unable to delete question',
        disallowClose: true,
      });
    }
  };

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
        Header: 'Answers',
        accessor: 'answers',
        Cell: ({ row }) => {
          const answers = row?.values?.answers;
          if (row?.original?.autoAnswers === 'area') {
            return 'Area Answers';
          }
          if (!answers) return 0;
          return `${answers.length} Answer${answers.length === 1 ? '' : 's'}`;
        },
      },
      {
        Header: 'Actions',
        accessor: 'id',
        Cell: (cell) => {
          // @ts-ignore
          if (cell.row.original?.isLocked) return null;
          return (
            <Group>
              <ActionIcon
                component={Link}
                to={`./${cell.row.original?.id}/edit`}
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
                    onClick={() => handleDelete(cell.cell.row.original.id)}
                  >
                    Delete
                  </Button>
                </Popover.Dropdown>
              </Popover>
            </Group>
          );
        },
      },
    ],
    []
  );
  const debouncedOrder = useDebouncedCallback(async (questions: any[]) => {
    const batch = writeBatch(db);

    showNotification({
      loading: true,
      title: 'Saving your data',
      message: 'Please wait before closing the page.',
      autoClose: false,
      disallowClose: true,
    });
    // Update the population of 'SF'
    questions.forEach((q, i) => {
      const qRef = doc(db, 'questions', q.id);
      batch.update(qRef, { order: i });
      return;
    });

    // Commit the batch
    await batch.commit();
    cleanNotifications();
    showNotification({
      color: 'teal',
      title: 'Data was saved',
      message:
        'Notification will close in 2 seconds, you can close this notification now',
      autoClose: 2000,
    });
  }, 3000);

  const moveRow = (dragIndex, hoverIndex) => {
    const dragRecord = records[dragIndex];
    const updatedRecords = update(records, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, dragRecord],
      ],
    });

    debouncedOrder(updatedRecords);
    setRecords(updatedRecords);
  };

  const { getTableProps, getTableBodyProps, rows, prepareRow } = useTable({
    columns,
    data: records,
    getRowId,
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <Table
        style={{ marginBottom: '60px' }}
        {...getTableProps()}
        verticalSpacing={'md'}
        highlightOnHover
      >
        <thead>
          <tr>
            {!orderLocked && <th>Order</th>}
            <th>Title</th>
            <th>Type</th>
            <th>Locked</th>
            <th>Answers</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody {...getTableBodyProps()}>
          {orderLocked
            ? rows.map((row, i) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => {
                      return (
                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                      );
                    })}
                  </tr>
                );
              })
            : rows.map(
                (row, index) =>
                  prepareRow(row) || (
                    <Row
                      index={index}
                      row={row}
                      moveRow={moveRow}
                      {...row.getRowProps()}
                    />
                  )
              )}
        </tbody>
      </Table>
    </DndProvider>
  );
};
