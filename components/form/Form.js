import React, { useRef, useState, useContext, useMemo } from "react";
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

  // Some elements (file inputs) read their value asynchronously. Wait for those
  // reads to be published to the form before validating or submitting.
  ready() {
    const elements = this.elements;
    return Promise.all(
      Object
        .keys(elements)
        .map(k => elements[k].whenReady && elements[k].whenReady())
        .filter(Boolean)
    );
  }
}

export const FormContext = React.createContext({
  form: {},
  submitting: false,
  submitted: false,
  hasChanges: false,
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
  // Mirrors `form` so that submitting reads the latest values even when a field
  // published them after the last render.
  const formRef = useRef(form);

  const register = (element) => {
    if (element) {
      const name = element.props.properties.name;
      formElements.current.elements[name] = element;
    }
  }

  const handleFormChange = (formValue) => {
    formRef.current = {
      ...formRef.current,
      ...formValue
    };
    setForm(formRef.current);
  }

  const setSubmitting = (value) => {
    _setSubmitting(value);
    onStatusChange && onStatusChange({ submitting: value, submitted });
  };
  const setSubmitted = (value) => {
    _setSubmitted(value);
    onStatusChange && onStatusChange({ submitted: value, submitting });
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();

    // A file dropped just before submitting may still be being read
    await formElements.current.ready();

    // Validate the form
    formElements.current.validate();

    // Set a timeout due to the setState function of react
    setTimeout(() => {
      // Validate all the inputs on the current step
      const valid = formElements.current.isValid();

      if (valid) {
        // Start the submitting
        setSubmitting(true);

        onSubmit({ form: formRef.current, setFormValues: handleFormChange })
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

  const hasChanges = useMemo(() => {
    if (!initialValues) return true;
    return Object.keys(initialValues).some(key => form[key] !== initialValues[key]);
  }, [form, initialValues]);

  const contextValue = {
    form,
    setFormValues: handleFormChange,
    handleSubmit,
    register,
    submitting,
    submitted,
    hasChanges,
  }

  return (
    <>
      <Spinner isLoading={submitting} className="-light -fixed" />
      <FormContext.Provider value={contextValue}>
        {/* eslint-disable-next-line react-hooks/refs -- contextValue's callbacks close over refs but are only invoked from events */}
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
