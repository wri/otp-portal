import isEmpty from "lodash/isEmpty";

class Validator {
  constructor(intl) {
    // Validations
    this.validations = {
      required: {
        validate(value) {
          if (typeof value === 'object') return !isEmpty(value);

          const regex = /.*\S.*/;
          const val = (typeof value !== 'undefined' && value !== null) ? value : '';

          if (typeof value === 'boolean') {
            return value;
          }

          return regex.test(val);
        },
        message: intl.formatMessage({ id: 'The field is required' })
      },

      email: {
        validate(value) {
          const regex = /\S+@\S+\.\S+/;
          return regex.test(value || '');
        },
        message: intl.formatMessage({ id: 'The field should be a valid email address' })
      },

      url: {
        validate(value) {
          const regex = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
          return regex.test(value || '');
        },
        message: intl.formatMessage({ id: 'The field should be a valid url: http://example.com' })
      },

      isEqual: {
        validate(value, condition) {
          return value === condition;
        }
      }

    };
  }

  validate(validations, value) {
    return validations.map((validation) => {
      let valid;
      let message = '';

      if (typeof validation === 'string') {
        const validObj = this.validations[validation];
        valid = validObj.validate(value);
        message = validation.message || validObj.message || '';
      }

      if (typeof validation === 'object') {
        const validObj = this.validations[validation.type];
        valid = validObj.validate(value, validation.condition);
        message = validation.message || validObj.message || '';
      }

      return {
        valid,
        error: (!valid) ? {
          message
        } : null
      };
    });
  }
}

export default Validator;
