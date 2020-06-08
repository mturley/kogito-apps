/* tslint:disable */
import React, { useState, useRef, useEffect, useReducer } from 'react';
import {
  expandable,
  Table,
  TableHeader,
  sortable,
  TableGridBreakpoint
} from '@patternfly/react-table';
import { CellMeasurerCache, CellMeasurer } from 'react-virtualized';
import {
  AutoSizer,
  VirtualTableBody
} from '@patternfly/react-virtualized-extension';
import { parentCreator, getChildRow } from './utils/Utils';
import { debounce } from '@patternfly/react-core';

interface IOwnProps {
  instances: any;
  childrenByParentItemId: any;
  fetchChildren: any;
}

const ProcessInstanceTable: React.FC<IOwnProps> = ({
  instances,
  childrenByParentItemId,
  fetchChildren
}) => {
  const tableBodyRef = useRef(null);
  // @ts-ignore
  const [_, forceUpdate] = useReducer(x => x + 1, 0);
  // https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate

  useEffect(() => {
    const handleResize = debounce(() => forceUpdate(), 100);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  //@ts-ignore
  const [isOpenStateByItemId, setisOpenStateByItemId] = useState({});

  //@ts-ignore
  const toggleRowOpen = item => {
    setisOpenStateByItemId({
      ...isOpenStateByItemId,
      [item.id]: !isOpenStateByItemId[item.id]
    });
  };

  const rows = [];
  instances.length !== 0 &&
    instances.forEach(instance => {
      const modifiedRowItem = parentCreator(
        instance,
        isOpenStateByItemId[instance.id]
      );
      rows.push(modifiedRowItem);
      if (isOpenStateByItemId[instance.id]) {
        const childItem = childrenByParentItemId[instance.id];
        const parentIndex = rows.length - 1;
        rows.push(getChildRow(childItem, parentIndex));
      }
    });

  const columns = [
    {
      title: 'Process',
      cellFormatters: [expandable],
      transforms: [sortable], // TODO implement the sortable stuff
      props: { style: { width: '25%' } }
    },
    {
      title: 'State',
      transforms: [sortable],
      props: { style: { width: '20%' } }
    },
    {
      title: 'Created',
      transforms: [sortable],
      props: { style: { width: '20%' } }
    },
    {
      title: 'Last update',
      transforms: [sortable],
      props: { style: { width: '35%' } }
    }
  ];

  const onCollapse = (event, rowIndex, isOpen) => {
    const parentInstance = instances.find(
      instance => instance.id === rows[rowIndex].props.id
    );
    toggleRowOpen(parentInstance);
    if (isOpen && !childrenByParentItemId[parentInstance.id]) {
      fetchChildren(parentInstance);
    }
  };

  const onSelect = () => {};

  const measurementCache = new CellMeasurerCache({
    fixedWidth: true,
    minHeight: 44,
    keyMapper: rowIndex => rowIndex // TODO is this a problem if our row indexes are dynamic?
  });

  const rowRenderer = ({ index, isScrolling, key, style, parent }) => {
    const row = rows[index];
    const isParentRow = row.parent === undefined;
    const parentRow = isParentRow ? row : rows[row.parent];

    // The virtualized extension does not work with the table row renderer built into Table,
    // so we'll need to implement any special behavior ourselves here based on row properties / transforms.
    // (props, selectable, fullWidth, expandable, sortable)
    // Based on the core HTML examples for Table here: https://www.patternfly.org/v4/documentation/core/components/table

    const toggleId = `table-expandable-toggle-${index}`;
    const contentId = `table-expandable-content-${index}`;

    return (
      <CellMeasurer
        cache={measurementCache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        <tbody
          role="rowgroup"
          className={parentRow.isOpen ? 'pf-m-expanded' : ''}
          style={style}
        >
          <tr data-id={index} role="row" {...row.props}>
            {isParentRow && (
              <>
                <td className="pf-c-table__toggle" role="cell">
                  <button
                    className={`pf-c-button pf-m-plain ${
                      row.isOpen ? 'pf-m-expanded' : ''
                    }`}
                    aria-labelledby={toggleId}
                    id={toggleId}
                    aria-label="Details"
                    aria-controls={contentId}
                    aria-expanded="true"
                    onClick={event => onCollapse(event, index, !row.isOpen)}
                  >
                    <div className="pf-c-table__toggle-icon">
                      <i className="fas fa-angle-down" aria-hidden="true"></i>
                    </div>
                  </button>
                </td>
                <td data-key="0" className="pf-c-table__check" role="gridcell">
                  <input
                    type="checkbox"
                    checked={rows[index].selected}
                    onChange={e => {
                      // @ts-ignore
                      // TODO this may need to be tweaked once onSelect is implemented
                      onSelect(e, e.target.checked, 0, { id: rows[index].id });
                    }}
                  />
                </td>
              </>
            )}
            {row.cells.map((cell, colIndex) => {
              return (
                <td
                  key={colIndex}
                  colSpan={row.fullWidth ? columns.length + 1 : 1}
                  role="gridcell"
                  {...cell.props}
                >
                  {cell.title}
                </td>
              );
            })}
          </tr>
        </tbody>
      </CellMeasurer>
    );
  };

  return (
    <>
      <Table
        aria-label="Collapsible table"
        onCollapse={onCollapse}
        rows={rows}
        cells={columns}
        onSelect={onSelect}
        gridBreakPoint={TableGridBreakpoint.none}
      >
        <TableHeader />
      </Table>
      <AutoSizer disableHeight>
        {({ width }) => (
          <VirtualTableBody
            ref={tableBodyRef}
            className="pf-c-table pf-c-virtualized pf-c-window-scroller"
            deferredMeasurementCache={measurementCache}
            rowHeight={measurementCache.rowHeight}
            height={400}
            overscanRowCount={2}
            columnCount={1}
            rows={rows}
            rowCount={rows.length}
            rowRenderer={rowRenderer}
            width={width}
          />
        )}
      </AutoSizer>
    </>
  );
};

export default ProcessInstanceTable;
