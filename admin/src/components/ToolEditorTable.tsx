import { Checkbox, createStyles, Table } from '@mantine/core';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTable } from 'react-table';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';

// needed for row & cell level scope DnD setup

type Props = {
  data: any;
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
      <td ref={dragRef}>move</td>
      {row.cells.map((cell) => {
        return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
      })}
    </tr>
  );
};

export const ToolEditorTable: React.FC<Props> = ({ data }) => {
  const [records, setRecords] = useState(data);

  const getRowId = useCallback((row) => {
    return row.id;
  }, []);

  const columns = useMemo(
    () => [
      // {
      //   Header: 'order',
      //   Cell: ({ row }) => {
      //     return <RowDragHandleCell rowId={row.id} />;
      //   },
      // },
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
        Cell: ({ row }) => {
          return <div>x</div>;
        },
      },
    ],
    []
  );

  const moveRow = (dragIndex, hoverIndex) => {
    const dragRecord = records[dragIndex];
    setRecords(
      update(records, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragRecord],
        ],
      })
    );
  };

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data: records,
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
            <th>Order</th>
            <th>Title</th>
            <th>Type</th>
            <th>Locked</th>
            <th>Answers</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(
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
