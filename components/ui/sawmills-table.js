import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';

// Redux
import { connect } from 'react-redux';

// Intl
import { injectIntl } from 'react-intl';

// Services
import modal from 'services/modal';
import SawmillsService from 'services/sawmillsService';

// Components
import Checkbox from 'components/form/Checkbox';
import Icon from 'components/ui/icon';
import Spinner from 'components/ui/spinner';

// Constants

const SawmillModal = dynamic(() => import('components/ui/sawmill-modal'), { ssr: false });

const SawmillsTable = ({ user, sawmills, onChange, intl }) => {
  const [loading, setLoading] = useState(false);
  
  const sawmillsService = useMemo(() => new SawmillsService({
    authorization: user.token
  }), [user.token]);

  const handleSawmillActiveDelete = (id) => {
    setLoading(true);

    sawmillsService.deleteSawmill(id)
      .then(() => {
        setLoading(false);
        onChange && onChange();
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  };

  const handleEditSawmill = (sawmill) => {
    modal.toggleModal(true, {
      children: SawmillModal,
      childrenProps: {
        user,
        sawmills,
        onChange,
        intl,
        sawmill,
        onChange: () => {
          onChange && onChange();
        }
      }
    });
  };

  return (
    <div className="c-options-table -fluid -valid c-field">
      <Spinner isLoading={loading} className="-tiny -transparent" />
      <table>
        <thead>
          <tr>
            <th>{intl.formatMessage({ id: 'sawmills.table.name' })}</th>
            <th className="option-header-center">{intl.formatMessage({ id: 'sawmills.table.active' })}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {sawmills.length > 0 && sawmills.map(sawmill => (
            <tr key={`sawmill-row-${sawmill.id}`}>
              <td>
                <span>{sawmill.name}</span>
              </td>
              <td className="options-checkbox-column">
                <Checkbox
                  properties={{
                    className: 'options-checkbox',
                    name: sawmill.id,
                    checked: sawmill['is-active'],
                    value: sawmill.id,
                    disabled: true
                  }}
                />
              </td>
              <td>
                <button
                  className="c-button -primary options-button"
                  type="button"
                  onClick={() => handleEditSawmill(sawmill)}
                >
                  <Icon name="icon-pencil" />
                </button>
                <button
                  className="c-button -secondary options-button"
                  type="button"
                  onClick={() => handleSawmillActiveDelete(sawmill.id)}
                >
                  <Icon name="icon-bin" />
                </button>
              </td>
            </tr>
        ))}
        </tbody>
      </table>
      {!sawmills.length > 0 &&
        <p>{intl.formatMessage({ id: 'edit.operators.sawmills.empty' })}</p>
      }
    </div>
  );
};

SawmillsTable.propTypes = {
  user: PropTypes.object,
  sawmills: PropTypes.array,
  onChange: PropTypes.func,
  intl: PropTypes.object.isRequired
};

export default injectIntl(connect(
  state => ({
    user: state.user
  })
)(SawmillsTable));
