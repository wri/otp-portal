import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { injectIntl } from 'react-intl';

// Redux
import { connect } from 'react-redux';
import { updateOperator, updateFmu } from 'modules/user';
import {
  getSawMillsByOperatorId,
  getSawMillsLocationByOperatorId
} from 'modules/operators-detail';
import { toastr } from 'react-redux-toastr';

// Services
import modal from 'services/modal';

// Components
import Form, { FormProvider } from 'components/form/Form';
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import Textarea from 'components/form/Textarea';
import FileImage from 'components/form/FileImage';
import FmusCheckboxGroup from 'components/form/FmusCheckboxGroup';
import Select from 'components/form/SelectInput';
import SawmillsTable from 'components/ui/sawmills-table';
import SawmillModal from 'components/ui/sawmill-modal';

// Utils
import { HELPERS_REGISTER } from 'utils/signup';
import { HELPERS_FMU } from 'utils/fmu';
import SubmitButton from '../form/SubmitButton';

class EditOperator extends React.Component {
  constructor(props) {
    super(props);

    const { operator } = props;

    this.state = {
      formInitialState: {
        name: operator.name || '',
        details: operator.details || '',
        operator_type: operator['operator-type'],
        logo: operator.logo && operator.logo.url,
        address: operator.address || '',
        website: operator.website || '',
        country: operator.country.id,
        fmus: operator.fmus.map(f => f.id)
      },
      certifications: HELPERS_REGISTER.getFMUCertificationsValues(operator.fmus),
      countryOptions: [],
      fmusOptions: [],
      fmusLoading: true
    };

    // Bindings
    this.fetchSawmills = this.fetchSawmills.bind(this);
  }

  componentDidMount() {
    this.getCountries();
    this.fetchSawmills();
    this.fetchFmus(); // fetching operator fmus to have them in chosen language
  }

  onChangeCertifications(value) {
    const certifications = Object.assign({}, this.state.certifications, value);
    this.setState({ certifications });
  }

  handleSubmit = ({ form }) => {
    const { intl } = this.props;

    return this.props.updateOperator({
      body: HELPERS_REGISTER.getBody(form, this.props.operator.id),
      type: 'PATCH',
      id: this.props.operator.id,
      authorization: this.props.user.token
    }).then(() => {
      const promises = [];

      if (Object.keys(this.state.certifications).length) {
        Object.keys(this.state.certifications).forEach((k) => {
          promises.push(this.props.updateFmu({
            id: k,
            body: HELPERS_REGISTER.getBodyFmu(
              this.state.certifications[k],
              k
            ),
            authorization: this.props.user.token
          }));
        });

        return Promise.all(promises);
      }
    }).then(() => {
      toastr.success(
        intl.formatMessage({ id: 'operators.edit.toaster.success.title' }),
        intl.formatMessage({ id: 'operators.edit.toaster.success.content' })
      );
    });
  }

  fetchSawmills() {
    const { operator } = this.props;
    this.props.getSawMillsByOperatorId(operator.id);
    this.props.getSawMillsLocationByOperatorId(operator.id);
  }

  async getCountries() {
    const { language } = this.props;
    const countries = await HELPERS_REGISTER.getCountries(language);
    this.setState({
      countryOptions: countries
    });
  }

  async fetchFmus() {
    const { language, operator } = this.props;
    this.setState({ fmusLoading: true });
    const fmus = await HELPERS_FMU.getFmusByOperatorId(operator.id, language);
    this.setState({
      fmusOptions: fmus,
      fmusLoading: false
    });
  }

  handleAddSawmill = (e) => {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: SawmillModal,
      childrenProps: {
        ...this.props,
        onChange: this.fetchSawmills
      }
    });
  }

  render() {
    const { intl, sawmills } = this.props;

    return (
      <div className="c-section">
        <FormProvider onSubmit={this.handleSubmit} initialValues={this.state.formInitialState}>
          <Form>
            <fieldset className="c-field-container">
              <h2 className="c-title -huge">
                {intl.formatMessage({ id: 'info.operator' })}
              </h2>

              <Field
                validations={['required']}
                className="-fluid"
                properties={{
                  name: 'name',
                  label: intl.formatMessage({ id: 'signup.operators.form.field.name' }),
                  required: true
                }}
              >
                {Input}
              </Field>

              {/* Operator description */}
              <Field
                className="-fluid"
                properties={{
                  name: 'details',
                  label: intl.formatMessage({ id: 'signup.operators.form.field.details' }),
                  rows: '6'
                }}
              >
                {Textarea}
              </Field>

              {/* Operator type */}
              <Field
                validations={['required']}
                className="-fluid"
                options={HELPERS_REGISTER.getOperatorTypes().map(t => ({
                  ...t,
                  label: intl.formatMessage({ id: t.label })
                }))}
                properties={{
                  name: 'operator_type',
                  label: intl.formatMessage({ id: 'signup.operators.form.field.operator_type' }),
                  required: true,
                  instanceId: 'select.operator_type'
                }}
              >
                {Select}
              </Field>

              {/* Website */}
              <Field
                validations={['url']}
                className="-fluid"
                properties={{
                  name: 'website',
                  label: intl.formatMessage({ id: 'signup.operators.form.field.website' })
                }}
              >
                {Input}
              </Field>

              {/* Address */}
              <Field
                className="-fluid"
                properties={{
                  name: 'address',
                  label: intl.formatMessage({ id: 'signup.operators.form.field.address' })
                }}
              >
                {Input}
              </Field>

              {/* Logo */}
              <Field
                className="-fluid"
                properties={{
                  name: 'logo',
                  label: intl.formatMessage({ id: 'signup.operators.form.field.logo' }),
                }}
              >
                {FileImage}
              </Field>

            </fieldset>

            <fieldset className="c-field-container">
              <h2 className="c-title -huge">
                {intl.formatMessage({ id: 'forest-management-units' })}
              </h2>

              <div className="c-field-row">
                {/* Country */}
                <Field
                  validations={['required']}
                  className="-fluid"
                  options={this.state.countryOptions}
                  properties={{
                    name: 'country',
                    label: intl.formatMessage({ id: 'signup.operators.form.field.country' }),
                    required: true,
                    disabled: true,
                    instanceId: 'select.country'
                  }}
                >
                  {Select}
                </Field>

                {/* FMUs */}
                {!!this.state.fmusOptions.length && (
                  <Field
                    name="fmus"
                    onChangeCertifications={value => this.onChangeCertifications(value)}
                    className="-fluid"
                    options={this.state.fmusOptions}
                    certifications={this.state.certifications}
                    properties={{
                      name: 'fmus'
                    }}
                  >
                    {FmusCheckboxGroup}
                  </Field>
                )}

              </div>
            </fieldset>

            <fieldset className="c-field-container">
              <h2 className="c-title -huge">
                {intl.formatMessage({ id: 'edit.operators.sawmills.title' })}
              </h2>

              <SawmillsTable
                sawmills={sawmills.data}
                onChange={this.fetchSawmills}
              />

              <button
                onClick={this.handleAddSawmill} className="c-button -small -secondary"
              >
                {intl.formatMessage({ id: 'edit.operators.sawmills.add' })}
              </button>
            </fieldset>

            <ul className="c-field-buttons">
              <li>
                <SubmitButton>
                  {intl.formatMessage({ id: 'update.operator' })}
                </SubmitButton>
              </li>
            </ul>
          </Form>
        </FormProvider>
      </div >
    );
  }
}

EditOperator.propTypes = {
  language: PropTypes.string,
  user: PropTypes.object,
  operator: PropTypes.object,
  updateOperator: PropTypes.func,
  updateFmu: PropTypes.func,
  onSubmit: PropTypes.func,
  sawmills: PropTypes.object,
  getSawMillsByOperatorId: PropTypes.func,
  getSawMillsLocationByOperatorId: PropTypes.func,
  intl: PropTypes.object.isRequired
};

export default injectIntl(connect(
  state => ({
    user: state.user,
    sawmills: state.operatorsDetail.sawmills,
    language: state.language
  }),
  {
    updateOperator,
    updateFmu,
    getSawMillsByOperatorId,
    getSawMillsLocationByOperatorId
  }
)(EditOperator));
