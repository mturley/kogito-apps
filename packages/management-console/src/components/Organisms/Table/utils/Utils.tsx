/* tslint:disable */
import React from 'react';
import ProcessDescriptor from '../../../Molecules/ProcessDescriptor/ProcessDescriptor';
import EndpointLink from '../../../Molecules/EndpointLink/EndpointLink';
import { Link } from 'react-router-dom';
import { stateIconCreator } from '../../../../utils/Utils';
import Moment from 'react-moment';
import { HistoryIcon } from '@patternfly/react-icons';
import SpinnerComponent from '../../../Atoms/SpinnerComponent/SpinnerComponent';
import {
  TableVariant,
  sortable,
  TableHeader,
  TableBody,
  Table
} from '@patternfly/react-table';
import { Bullseye } from '@patternfly/react-core';
import EmptyStateComponent from '../../../Atoms/EmptyStateComponent/EmptyStateComponent';

export const parentCreator = (processInstance, isOpen) => {
  const modifiedRowsItem = {
    cells: [
      {
        title: (
          <React.Fragment>
            <Link to={'/Process/' + processInstance.id}>
              <div>
                <strong>
                  <ProcessDescriptor processInstanceData={processInstance} />
                </strong>
              </div>
            </Link>
            <EndpointLink
              serviceUrl={processInstance.serviceUrl}
              isLinkShown={false}
            />
          </React.Fragment>
        ),
        props: {
          style: {
            width: '25%'
          }
        }
      },
      {
        title: (
          <React.Fragment>
            {stateIconCreator(processInstance.state)}
          </React.Fragment>
        ),
        props: {
          style: {
            width: '20%'
          }
        }
      },
      {
        title: (
          <React.Fragment>
            {processInstance.start ? (
              <Moment fromNow>{new Date(`${processInstance.start}`)}</Moment>
            ) : (
              ''
            )}
          </React.Fragment>
        ),
        props: {
          style: {
            width: '20%'
          }
        }
      },
      {
        title: (
          <React.Fragment>
            {processInstance.lastUpdate ? (
              <span>
                {' '}
                <HistoryIcon className="pf-u-mr-sm" /> Updated{' '}
                <Moment fromNow>
                  {new Date(`${processInstance.lastUpdate}`)}
                </Moment>
              </span>
            ) : (
              ''
            )}
          </React.Fragment>
        ),
        props: {
          style: {
            width: '35%'
          }
        }
      }
    ],
    props: { id: processInstance.id }
  };
  modifiedRowsItem['isOpen'] = !!isOpen;

  return modifiedRowsItem;
};

const onSelect = () => {};

export const getChildRow = (childItem, parentIndex) => {
  if (childItem) {
    if (childItem.ProcessInstances.length === 0) {
      return {
        parent: parentIndex,
        cells: [
          {
            title: (
              <Bullseye>
                {' '}
                <EmptyStateComponent
                  iconType="infoCircleIcon"
                  title="No child process instances"
                  body="This process has no related sub processes"
                />
              </Bullseye>
            )
          },
          '',
          '',
          '',
          ''
        ]
      };
    } else {
      return {
        parent: parentIndex,
        fullWidth: true,
        cells: [
          {
            title: (
              <React.Fragment>
                <Table
                  aria-label="Sub-process Instances"
                  variant={TableVariant.compact}
                  cells={[
                    { title: 'Subprocesses', transforms: [sortable] },
                    '',
                    '',
                    ''
                  ]}
                  rows={getModifiedChildRows(childItem)}
                  onSelect={onSelect}
                  canSelectAll={false}
                >
                  <TableHeader />
                  <TableBody />
                </Table>
              </React.Fragment>
            ),
            props: {
              style: {
                width: '100%'
              }
            }
          }
        ]
      };
    }
  } else {
    return {
      parent: parentIndex,
      cells: [
        {
          title: (
            <Bullseye>
              <SpinnerComponent spinnerText="loading child instances ..." />
            </Bullseye>
          )
        },
        '',
        '',
        '',
        ''
      ]
    };
  }
};

const getModifiedChildRows = childItems => {
  const arrayOfChildren = [];
  childItems.ProcessInstances.map(child => {
    arrayOfChildren.push([
      {
        title: (
          <React.Fragment>
            <Link to={'/Process/' + child.id}>
              <div>
                <strong>
                  <ProcessDescriptor processInstanceData={child} />
                </strong>
              </div>
            </Link>
            <EndpointLink serviceUrl={child.serviceUrl} isLinkShown={false} />
          </React.Fragment>
        )
      },
      {
        title: <React.Fragment>{stateIconCreator(child.state)}</React.Fragment>
      },
      {
        title: (
          <React.Fragment>
            {child.start ? (
              <Moment fromNow>{new Date(`${child.start}`)}</Moment>
            ) : (
              ''
            )}
          </React.Fragment>
        )
      },
      {
        title: (
          <React.Fragment>
            {child.lastUpdate ? (
              <span>
                {' '}
                <HistoryIcon className="pf-u-mr-sm" /> Updated{' '}
                <Moment fromNow>{new Date(`${child.lastUpdate}`)}</Moment>
              </span>
            ) : (
              ''
            )}
          </React.Fragment>
        )
      }
    ]);
  });
  return arrayOfChildren;
};
