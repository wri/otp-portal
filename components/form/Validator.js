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

      minLength: {
        validate(value, condition) {
          return value.length >= condition;
        },
        message: (condition) => intl.formatMessage({ id: 'validation.minLength', defaultMessage: 'The field should have at least {min} characters' }, { min: condition })
      },

      maxLength: {
        validate(value, condition) {
          return value.length <= condition;
        },
        message: (condition) => intl.formatMessage({ id: 'validation.maxLength', defaultMessage: 'The field should have at most {max} characters' }, { max: condition })
      },

      haveLowercaseLetter: {
        validate(value) {
          const regex = /(?=.*[a-z]).+/;
          return regex.test(value || '');
        },
        message: intl.formatMessage({ id: 'validation.haveLowercaseLetter', defaultMessage: 'The field should have at least one lowercase letter' })
      },

      haveUppercaseLetter: {
        validate(value) {
          const regex = /(?=.*[A-Z]).+/;
          return regex.test(value || '');
        },
        message: intl.formatMessage({ id: 'validation.haveUppercaseLetter', defaultMessage: 'The field should have at least one capital (uppercase) letter' })
      },

      haveDigit: {
        validate(value) {
          const regex = /(?=.*\d).+/;
          return regex.test(value || '');
        },
        message: intl.formatMessage({ id: 'validation.haveDigit', defaultMessage: 'The field should have at least one digit' })
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
        message = validation.message || ((validObj.message && typeof validObj.message === 'function') ? validObj.message(validation.condition) : validObj.message)  || '';
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
