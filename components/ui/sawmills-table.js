import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Services
import modal from 'services/modal';
import SawmillsService from 'services/sawmillsService';

// Components
import Checkbox from 'components/form/Checkbox';
import Icon from 'components/ui/icon';
import SawmillModal from 'components/ui/sawmill-modal';
import Spinner from 'components/ui/spinner';

// Constants

class SawmillsTable extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    sawmills: PropTypes.array,
    onChange: PropTypes.func,
    intl: intlShape.isRequired
  };

  constructor(props) {
    super(props);
    this.sawmillsService = new SawmillsService({
      authorization: props.user.token
    });
  }

  state = {
    loading: false
  };

  handleSawmillActiveDelete(id) {
    const { user } = this.props;

    this.setState({ loading: true });

    this.sawmillsService.deleteSawmill(id, user)
      .then(() => {
        this.setState({ loading: false });
        this.props.onChange && this.props.onChange();
      })
      .catch((err) => {
        this.setState({ loading: false });
        console.error(err);
      });
  }

  handleEditSawmill(sawmill) {
    modal.toggleModal(true, {
      children: SawmillModal,
      childrenProps: {
        ...this.props,
        sawmill,
        onChange: () => {
          this.props.onChange && this.props.onChange();
        }
      }
    });
  }

  render() {
    const { sawmills } = this.props;
    const { loading } = this.state;

    return (
      <div className="c-options-table -fluid -valid c-field">
        <Spinner isLoading={loading} className="-tiny -transparent" />
        <table>
          <thead>
            <tr>
              <th>{this.props.intl.formatMessage({ id: 'sawmills.table.name' })}</th>
              <th className="option-header-center">{this.props.intl.formatMessage({ id: 'sawmills.table.active' })}</th>
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
                    onClick={() => this.handleEditSawmill(sawmill)}
                  >
                    <Icon name="icon-pencil" />
                  </button>
                  <button
                    className="c-button -secondary options-button"
                    type="button"
                    onClick={() => this.handleSawmillActiveDelete(sawmill.id)}
                  >
                    <Icon name="icon-bin" />
                  </button>
                </td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
    );
  }

}

export default injectIntl(connect(
  state => ({
    user: state.user
  })
)(SawmillsTable));
