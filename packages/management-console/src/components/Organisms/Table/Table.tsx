/* tslint:disable */
import React, { useState } from 'react';
import {
  expandable,
  Table,
  TableBody,
  TableHeader,
  sortable
} from '@patternfly/react-table';
import { parentCreator, getChildRow } from './utils/Utils';

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
      transforms: [sortable]
    },
    { title: 'State', transforms: [sortable] },
    { title: 'Created', transforms: [sortable] },
    { title: 'Last update', transforms: [sortable] },
    ''
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
  return (
    <Table
      aria-label="Collapsible table"
      onCollapse={onCollapse}
      rows={rows}
      cells={columns}
      onSelect={onSelect}
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};

export default ProcessInstanceTable;
