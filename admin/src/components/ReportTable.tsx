// import { createStyles, Table } from '@mantine/core';
// import React, { useMemo } from 'react';
// import { useTable } from 'react-table';

// type Props<TIem> = {
//   data: TIem[];
// };

// const useStyles = createStyles((theme) => ({
//   td: {
//     marginBottom: theme.spacing.lg,
//     '&:first-of-type': {
//       borderTopLeftRadius: theme.radius.lg,
//       borderBottomLeftRadius: theme.radius.lg,
//     },
//     '&:last-of-type': {
//       borderTopRightRadius: theme.radius.lg,
//       borderBottomRightRadius: theme.radius.lg,
//     },
//   },
// }));

// export const ReportTable = <TItem extends readonly object[]>(
//   props: Props<TItem>
// ) => {
//   const { classes } = useStyles();
//   const toSentenceCase = (string: string) => {
//     const result = string.replace(/([A-Z])/g, ' $1');
//     return result.charAt(0).toUpperCase() + result.slice(1);
//   };
//   const columns = useMemo(() => {
//     if (props.data.length === 0) return [];
//     return Object.keys(props.data?.[0])?.map((key: string) => ({
//       Header: toSentenceCase(key),
//       accessor: key,
//     }));
//   }, []);

//   const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
//     useTable({
//       columns,
//       data: props.data,
//     });
//   return (
//     <Table
//       style={{ marginBottom: '60px' }}
//       {...getTableProps()}
//       verticalSpacing={'md'}
//       highlightOnHover
//     >
//       <thead>
//         {headerGroups.map((headerGroup) => (
//           <tr {...headerGroup.getHeaderGroupProps()}>
//             {headerGroup.headers.map((column) => (
//               <th {...column.getHeaderProps()}>{column.render('Header')}</th>
//             ))}
//           </tr>
//         ))}
//       </thead>
//       <tbody {...getTableBodyProps()}>
//         {rows.map((row, i) => {
//           prepareRow(row);
//           return (
//             <tr {...row.getRowProps()}>
//               {row.cells.map((cell) => {
//                 return (
//                   <td className={classes.td} {...cell.getCellProps()}>
//                     {cell.render('Cell')}
//                   </td>
//                 );
//               })}
//             </tr>
//           );
//         })}
//       </tbody>
//     </Table>
//   );
// };
