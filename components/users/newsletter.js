import React from 'react';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Components
import Field from 'components/form/Field';
import Input from 'components/form/Input';

const NewsletterForm = ({ intl }) => (
  <div className="c-section">
    <form className="c-form" action="https://connect.wri.org/l/120942/2022-03-31/582yt4" method="post">
      <fieldset className="c-field-container">
        <Field
          validations={['required', 'email']}
          className="-fluid"
          properties={{
            name: 'email',
            label: intl.formatMessage({ id: 'email' }),
            required: true,
          }}
        >
          {Input}
        </Field>
        <Field
          validations={['required']}
          className="-fluid"
          properties={{
            name: 'first_name',
            label: intl.formatMessage({ id: 'First Name' }),
            required: true,
          }}
        >
          {Input}
        </Field>
        <Field
          validations={['required']}
          className="-fluid"
          properties={{
            name: 'last_name',
            label: intl.formatMessage({ id: 'Last Name' }),
            required: true,
          }}
        >
          {Input}
        </Field>
        <Field
          validations={['required']}
          className="-fluid"
          properties={{
            name: 'job_title',
            label: intl.formatMessage({ id: 'Job Title' }),
            required: true,
          }}
        >
          {Input}
        </Field>
        <Field
          validations={['required']}
          className="-fluid"
          properties={{
            name: 'organization',
            label: intl.formatMessage({ id: 'Organization' }),
            required: true,
          }}
        >
          {Input}
        </Field>
        <Field
          validations={['required']}
          className="-fluid"
          properties={{
            name: 'city',
            label: intl.formatMessage({ id: 'City' }),
            required: true,
          }}
        >
          {Input}
        </Field>
        <Field
          validations={['required']}
          className="-fluid"
          properties={{
            name: 'country',
            label: intl.formatMessage({ id: 'Country' }),
            required: true,
          }}
        >
          {Input}
        </Field>
      </fieldset>

      <ul className="c-field-buttons">
        <li>
          <button
            type="submit"
            className={`c-button -secondary -expanded`}
          >
            {intl.formatMessage({ id: 'signup' })}
          </button>
        </li>
      </ul>
    </form>
  </div>
)

NewsletterForm.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(NewsletterForm);
