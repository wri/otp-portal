import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { useIntl } from 'react-intl';

// Redux
import { connect } from 'react-redux';
import { updateOperator } from 'modules/user';
import { toastr } from 'react-redux-toastr';

// Components
import Form, { FormProvider } from 'components/form/Form';
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import Textarea from 'components/form/Textarea';
import FileImage from 'components/form/FileImage';
import Select from 'components/form/SelectInput';

// Utils
import { HELPERS_REGISTER } from 'utils/signup';
import SubmitButton from '../form/SubmitButton';

import { CERTIFICATIONS } from 'constants/fmu';

const EditOperator = (props) => {
  // rewrite class component to functional component
  const { operator } = props;
  const intl = useIntl();
  const certifications = HELPERS_REGISTER.getFMUCertificationsValues(operator.fmus);

  const logoURL = (operator.logo && operator.logo.url) || '';

  const handleSubmit = ({ form }) => {
    // The logo is only sent when the user picked a new file (or removed it),
    // otherwise the form still holds the URL of the current one.
    const logoChanged = (form.logo || '') !== logoURL;

    return props.updateOperator({
      body: {
        data: {
          type: 'operators',
          id: operator.id,
          attributes: {
            name: form.name,
            details: form.details,
            'operator-type': form.operator_type,
            website: form.website,
            address: form.address,
            ...(logoChanged && { logo: form.logo })
          },
        }
      },
      type: 'PATCH',
      id: operator.id,
      locale: props.language
    }).then(() => {
      toastr.success(
        intl.formatMessage({ id: 'operators.edit.toaster.success.title' }),
        intl.formatMessage({ id: 'operators.edit.toaster.success.content' })
      );
    });
  }

  const formInitialState = {
    name: operator.name || '',
    details: operator.details || '',
    operator_type: operator['operator-type'],
    logo: logoURL,
    address: operator.address || '',
    website: operator.website || ''
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

              {/* Country */}
              <div className="c-field -fluid">
                <label className="label">
                  {intl.formatMessage({ id: 'signup.operators.form.field.country' })}
                </label>

                <div className="input">
                  {operator.country.name}
                </div>
              </div>

              <div className="c-field -fluid">
                <label className="label">
                  {intl.formatMessage({ id: 'forest-management-units' })}
                </label>

                <div className="c-field-row">
                  {/* FMUs */}
                  {!!operator.fmus.length && (
                    <div className={`c-fmu-certificates`}>
                      <table className="fmu-certificates-table">
                        <thead>
                          <tr>
                            <th>
                              {intl.formatMessage({ id: 'fmu' })}
                            </th>
                            <th className="td-certifications">
                              {intl.formatMessage({ id: 'certifications' })}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {operator.fmus.map(fmu => (
                            <tr key={fmu.id}>
                              <td>
                                {fmu.name}
                              </td>
                              <td className="td-certifications">
                                {(certifications[fmu.id] || []).length === 0 && "None"}
                                {(certifications[fmu.id] || []).map((value) => CERTIFICATIONS.find(c => c.value === value)?.label).filter(x => x).join(', ')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

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

            <ul className="c-field-buttons">
              <li>
                <SubmitButton disableIfNoChanges>
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
  operator: PropTypes.object,
  updateOperator: PropTypes.func,
  onSubmit: PropTypes.func
};

export default connect(
  state => ({
    language: state.language
  }),
  {
    updateOperator
  }
)(EditOperator);
