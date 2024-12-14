import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// Intl
import { useIntl } from 'react-intl';

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

// Utils
import { HELPERS_REGISTER } from 'utils/signup';
import { HELPERS_FMU } from 'utils/fmu';
import SubmitButton from '../form/SubmitButton';
import dynamic from 'next/dynamic';

const SawmillModal = dynamic(() => import('components/ui/sawmill-modal'), { ssr: false });

const EditOperator = (props) => {
  // rewrite class component to functional component
  const { operator, language, sawmills } = props;
  const intl = useIntl();
  const [certifications, setCertifications] = useState(HELPERS_REGISTER.getFMUCertificationsValues(operator.fmus));
  const [fmusOptions, setFmusOptions] = useState([]);
  const [fmusLoading, setFmusLoading] = useState(true);
  const [countryOptions, setCountryOptions] = useState([]);

  const fetchSawmills = () => {
    props.getSawMillsByOperatorId(operator.id);
    props.getSawMillsLocationByOperatorId(operator.id);
  }

  const getCountries = async () => {
    const countries = await HELPERS_REGISTER.getCountries(language);
    setCountryOptions(countries);
  }

  const fetchFmus = async () => {
    setFmusLoading(true);
    const fmus = await HELPERS_FMU.getFmusByOperatorId(operator.id, language);
    setFmusOptions(fmus);
    setFmusLoading(false);
  }

  useEffect(() => {
    getCountries();
    fetchSawmills();
    fetchFmus(); // fetching operator fmus to have them in chosen language
  }, [operator.id]);

  const onChangeCertifications = (value) => {
    setCertifications(Object.assign({}, certifications, value))
  }

  const handleSubmit = ({ form }) => {
    return props.updateOperator({
      body: HELPERS_REGISTER.getBody(form, operator.id),
      type: 'PATCH',
      id: operator.id,
      authorization: props.user.token
    }).then(() => {
      const promises = [];

      if (Object.keys(certifications).length) {
        Object.keys(certifications).forEach((k) => {
          promises.push(props.updateFmu({
            id: k,
            body: HELPERS_REGISTER.getBodyFmu(
              certifications[k],
              k
            ),
            authorization: props.user.token
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

  const handleAddSawmill = (e) => {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: SawmillModal,
      childrenProps: {
        ...props,
        onChange: fetchSawmills
      }
    });
  }

  const formInitialState = {
    name: operator.name || '',
    details: operator.details || '',
    operator_type: operator['operator-type'],
    logo: operator.logo && operator.logo.url,
    address: operator.address || '',
    website: operator.website || '',
    country: operator.country.id,
    fmus: operator.fmus.map(f => f.id)
  };

  return (
    <div className="c-section">
      <div className="l-container">
        <FormProvider onSubmit={handleSubmit} initialValues={formInitialState}>
          <Form>
            <fieldset className="c-field-container">
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
              <h2 className="c-title">
                {intl.formatMessage({ id: 'forest-management-units' })}
              </h2>

              <div className="c-field-row">
                {/* Country */}
                <Field
                  validations={['required']}
                  className="-fluid"
                  options={countryOptions}
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
                {!!fmusOptions.length && (
                  <Field
                    name="fmus"
                    onChangeCertifications={value => onChangeCertifications(value)}
                    className="-fluid"
                    options={fmusOptions}
                    certifications={certifications}
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
              <h2 className="c-title">
                {intl.formatMessage({ id: 'edit.operators.sawmills.title' })}
              </h2>

              <SawmillsTable
                sawmills={sawmills.data}
                onChange={fetchSawmills}
              />

              <button
                onClick={handleAddSawmill} className="c-button -small -secondary"
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
      </div>
    </div >
  );
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
  getSawMillsLocationByOperatorId: PropTypes.func
};

export default connect(
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
)(EditOperator);
