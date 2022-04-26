import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import sortBy from 'lodash/sortBy';

// Intl
import { injectIntl, intlShape } from 'react-intl';

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
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import Textarea from 'components/form/Textarea';
import FileImage from 'components/form/FileImage';
import FmusCheckboxGroup from 'components/form/FmusCheckboxGroup';
import Select from 'components/form/SelectInput';
import Spinner from 'components/ui/spinner';
import SawmillsTable from 'components/ui/sawmills-table';
import SawmillModal from 'components/ui/sawmill-modal';


// Utils
import { HELPERS_REGISTER } from 'utils/signup';
import { HELPERS_FMU } from 'utils/fmu';

// Constants
const FORM_ELEMENTS = {
  elements: {
  },
  validate() {
    const elements = this.elements;
    Object.keys(elements).forEach((k) => {
      elements[k].validate();
    });
  },
  isValid() {
    const elements = this.elements;
    const valid = Object.keys(elements)
      .map(k => elements[k].isValid())
      .filter(v => v !== null)
      .every(element => element);

    return valid;
  }
};

class EditOperator extends React.Component {
  constructor(props) {
    super(props);

    const { operator } = props;

    this.state = {
      form: {
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
      fmusOptions: [],
      fmusLoading: true,
      submitting: false,
      submitted: false
    };

    // Bindings
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.fetchSawmills = this.fetchSawmills.bind(this);
  }

  componentDidMount() {
    this.fetchSawmills();
    this.fetchFmus(); // fetching operator fmus to have them in chosen language
  }

  /**
   * UI EVENTS
   * - onChange
   * - onSubmit
  */
  onChange(value) {
    const form = Object.assign({}, this.state.form, value);
    this.setState({ form });
  }

  onChangeCertifications(value) {
    const certifications = Object.assign({}, this.state.certifications, value);
    this.setState({ certifications });
  }

  onSubmit(e) {
    e && e.preventDefault();

    // Validate the form
    FORM_ELEMENTS.validate(this.state.form);

    // Set a timeout due to the setState function of react
    setTimeout(() => {
      // Validate all the inputs on the current step
      const valid = FORM_ELEMENTS.isValid(this.state.form);

      if (valid) {
        // Start the submitting
        this.setState({ submitting: true });

        // Save data
        this.props.updateOperator({
          body: HELPERS_REGISTER.getBody(this.state.form, this.props.operator.id),
          type: 'PATCH',
          id: this.props.operator.id,
          authorization: this.props.user.token
        })
          .then(() => {
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

              Promise.all(promises)
                .then(() => {
                  toastr.success(
                    this.props.intl.formatMessage({ id: 'operators.edit.toaster.success.title' }),
                    this.props.intl.formatMessage({ id: 'operators.edit.toaster.success.content' })
                  );
                  this.setState({ submitting: false, submitted: true });
                  if (this.props.onSubmit) this.props.onSubmit();
                })
                .catch((errors) => {
                  this.setState({ submitting: false });
                  console.error(errors);
                });
            } else {
              this.setState({ submitting: false, submitted: true });
              if (this.props.onSubmit) this.props.onSubmit();
            }
          })
          .catch((errors) => {
            this.setState({ submitting: false });
            console.error(errors);

            try {
              errors.forEach(er =>
                toastr.error(this.props.intl.formatMessage({ id: 'Error' }), `${er.title} - ${er.detail}`)
              );
            } catch (e) {
              toastr.error(this.props.intl.formatMessage({ id: 'Error' }), this.props.intl.formatMessage({ id: 'Oops! There was an error, try again' }));
            }
          });
      } else {
        toastr.error(this.props.intl.formatMessage({ id: 'Error' }), this.props.intl.formatMessage({ id: 'Fill all the required fields' }));
      }
    }, 0);
  }

  fetchSawmills() {
    const { operator } = this.props;
    this.props.getSawMillsByOperatorId(operator.id);
    this.props.getSawMillsLocationByOperatorId(operator.id);
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
    const { submitting } = this.state;
    const { language, sawmills } = this.props;

    const submittingClassName = classnames({
      '-submitting': submitting
    });

    return (
      <div className="c-section">

        <Spinner isLoading={submitting} className="-light -fixed" />

        <form className="c-form" onSubmit={this.onSubmit} noValidate>
          <fieldset className="c-field-container">
            <h2 className="c-title -huge">
              {this.props.intl.formatMessage({ id: 'info.operator' })}
            </h2>

            {/* Operator name */}
            <Field
              ref={(c) => { if (c) FORM_ELEMENTS.elements.name = c; }}
              onChange={value => this.onChange({ name: value })}
              validations={['required']}
              className="-fluid"
              properties={{
                name: 'name',
                label: this.props.intl.formatMessage({ id: 'signup.operators.form.field.name' }),
                required: true,
                default: this.state.form.name
              }}
            >
              {Input}
            </Field>

            {/* Operator description */}
            <Field
              ref={(c) => { if (c) FORM_ELEMENTS.elements.details = c; }}
              onChange={value => this.onChange({ details: value })}
              className="-fluid"
              properties={{
                name: 'details',
                label: this.props.intl.formatMessage({ id: 'signup.operators.form.field.details' }),
                default: this.state.form.details,
                rows: '6'
              }}
            >
              {Textarea}
            </Field>

            {/* Operator type */}
            <Field
              ref={(c) => { if (c) FORM_ELEMENTS.elements.operator_type = c; }}
              onChange={value => this.onChange({ operator_type: value })}
              validations={['required']}
              className="-fluid"
              options={HELPERS_REGISTER.getOperatorTypes().map(t => ({
                ...t,
                label: this.props.intl.formatMessage({ id: t.label })
              }))}
              properties={{
                name: 'operator_type',
                label: this.props.intl.formatMessage({ id: 'signup.operators.form.field.operator_type' }),
                required: true,
                instanceId: 'select.operator_type',
                default: this.state.form.operator_type
              }}
            >
              {Select}
            </Field>

            {/* Website */}
            <Field
              ref={(c) => { if (c) FORM_ELEMENTS.elements.website = c; }}
              onChange={value => this.onChange({ website: value })}
              validations={['url']}
              className="-fluid"
              properties={{
                name: 'website',
                label: this.props.intl.formatMessage({ id: 'signup.operators.form.field.website' }),
                default: this.state.form.website
              }}
            >
              {Input}
            </Field>

            {/* Address */}
            <Field
              ref={(c) => { if (c) FORM_ELEMENTS.elements.address = c; }}
              onChange={value => this.onChange({ address: value })}
              className="-fluid"
              properties={{
                name: 'address',
                label: this.props.intl.formatMessage({ id: 'signup.operators.form.field.address' }),
                default: this.state.form.address
              }}
            >
              {Input}
            </Field>

            {/* Logo */}
            <Field
              ref={(c) => { if (c) FORM_ELEMENTS.elements.logo = c; }}
              onChange={value => this.onChange({ logo: value })}
              className="-fluid"
              properties={{
                name: 'logo',
                label: this.props.intl.formatMessage({ id: 'signup.operators.form.field.logo' }),
              }}
            >
              {FileImage}
            </Field>

          </fieldset>

          <fieldset className="c-field-container">
            <h2 className="c-title -huge">
              {this.props.intl.formatMessage({ id: 'forest-management-units' })}
            </h2>

            <div className="c-field-row">
              {/* Country */}
              <Field
                ref={(c) => { if (c) FORM_ELEMENTS.elements.country = c; }}
                validations={['required']}
                className="-fluid"
                loadOptions={() => HELPERS_REGISTER.getCountries(language)}
                properties={{
                  name: 'country',
                  label: this.props.intl.formatMessage({ id: 'signup.operators.form.field.country' }),
                  required: true,
                  disabled: true,
                  instanceId: 'select.country',
                  default: this.state.form.country
                }}
              >
                {Select}
              </Field>

              {/* FMUs */}
              {!!this.state.fmusOptions.length && (
                <Field
                  ref={(c) => { if (c) FORM_ELEMENTS.elements.fmus = c; }}
                  name="fmus"
                  onChange={value => this.onChange({ fmus: value })}
                  onChangeCertifications={value => this.onChangeCertifications(value)}
                  className="-fluid"
                  options={this.state.fmusOptions}
                  certifications={this.state.certifications}
                  properties={{
                    name: 'fmus',
                    default: this.state.form.fmus
                  }}
                >
                  {FmusCheckboxGroup}
                </Field>
              )}

            </div>
          </fieldset>

          <fieldset className="c-field-container">
            <h2 className="c-title -huge">
              {this.props.intl.formatMessage({ id: 'edit.operators.sawmills.title' })}
            </h2>

            <SawmillsTable
              sawmills={sawmills.data}
              onChange={this.fetchSawmills}
            />

            <button
              onClick={this.handleAddSawmill} className="c-button -small -secondary"
            >
              {this.props.intl.formatMessage({ id: 'edit.operators.sawmills.add' })}
            </button>
          </fieldset>

          <ul className="c-field-buttons">
            <li>
              <button
                type="submit"
                name="commit"
                disabled={submitting}
                className={`c-button -secondary -expanded ${submittingClassName}`}
              >
                {this.props.intl.formatMessage({ id: 'update.operator' })}
              </button>
            </li>
          </ul>
        </form>
      </div>
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
  intl: intlShape.isRequired
};

export default injectIntl(connect(
  state => ({
    user: state.user,
    sawmills: state.operatorsDetail.sawmills,
    language: state.language
  }),
  { updateOperator,
    updateFmu,
    getSawMillsByOperatorId,
    getSawMillsLocationByOperatorId
  }
)(EditOperator));
