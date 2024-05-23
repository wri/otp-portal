import React, { useRef, useState, useContext } from "react";
import { toastr } from 'react-redux-toastr';
import { useIntl } from "react-intl";
import uniqBy from 'lodash/uniqBy';

import Spinner from "components/ui/spinner";

class FormElements {
  constructor() {
    this.elements = {};
  }

  validate() {
    const elements = this.elements;
    Object.keys(elements).forEach((k) => {
      elements[k].validate();
    });
  }

  isValid() {
    const elements = this.elements;
    const valid = Object
      .keys(elements)
      .map(k => elements[k].isValid())
      .filter(v => v !== null)
      .every(element => element);

    return valid;
  }
}

export const FormContext = React.createContext({
  form: {},
  submitting: false,
  submitted: false,
  setFormValues: () => { },
  register: () => { },
})

export const withFormContext = Component => {
  const FormContextConsumer = (props) => {
    return (
      <FormContext.Consumer>
        {context => <Component ref={context.register} {...props} formContext={context} />}
      </FormContext.Consumer>
    )
  }
  FormContextConsumer.displayName = `withFormContext(${Component.displayName || Component.name})`;
  return FormContextConsumer;
}

export const useForm = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useForm must be used within a FormProvider')
  }
  return context;
}

export const FormProvider = ({ children, onSubmit, onStatusChange, initialValues }) => {
  const formElements = useRef(new FormElements());
  const intl = useIntl();
  const [submitting, _setSubmitting] = useState(false);
  const [submitted, _setSubmitted] = useState(false);
  const [form, setForm] = useState(initialValues || {});

  const register = (element) => {
    if (element) {
      const name = element.props.properties.name;
      formElements.current.elements[name] = element;
    }
  }

  const handleFormChange = (formValue) => {
    setForm({
      ...form,
      ...formValue
    });
  }

  const setSubmitting = (value) => {
    _setSubmitting(value);
    onStatusChange && onStatusChange({ submitting: value, submitted });
  };
  const setSubmitted = (value) => {
    _setSubmitted(value);
    onStatusChange && onStatusChange({ submitted: value, submitting });
  };

  const handleSubmit = (e) => {
    e && e.preventDefault();

    // Validate the form
    formElements.current.validate(form);

    // Set a timeout due to the setState function of react
    setTimeout(() => {
      // Validate all the inputs on the current step
      const valid = formElements.current.isValid(form);

      if (valid) {
        // Start the submitting
        setSubmitting(true);

        onSubmit({ form, setFormValues: handleFormChange })
          .then(() => {
            setSubmitting(false);
            setSubmitted(true);
          })
          .catch((error) => {
            setSubmitting(false);
            console.error(error);
            const errors = uniqBy(
              error.errors || [{ title: error.message }],
              (e) => `${e.title}-${e.detail}`
            );
            try {
              errors.forEach(er =>
                toastr.error(intl.formatMessage({ id: 'Error' }), er.detail || er.title)
              );
            } catch (e) {
              toastr.error(intl.formatMessage({ id: 'Error' }), intl.formatMessage({ id: 'Oops! There was an error, try again' }));
            }
          });
      } else {
        toastr.error(intl.formatMessage({ id: 'Error' }), intl.formatMessage({ id: 'Fill all the required fields' }));
      }
    }, 0);
  }

  const contextValue = {
    form,
    setFormValues: handleFormChange,
    handleSubmit,
    register,
    submitting,
    submitted,
  }

  return (
    <>
      <Spinner isLoading={submitting} className="-light -fixed" />
      <FormContext.Provider value={contextValue}>
        {typeof children === 'function' && children(contextValue)}
        {typeof children !== 'function' && children}
      </FormContext.Provider>
    </>
  );
};

export const Form = React.forwardRef(({ children, ...restFormProps }, ref) => {
  const { handleSubmit } = useForm();

  return (
    <form ref={ref} className="c-form" onSubmit={handleSubmit} noValidate {...restFormProps}>
      {children}
    </form>
  );
})
Form.displayName = 'Form';

export default Form;
