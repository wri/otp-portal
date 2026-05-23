import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

import FormElement from './FormElement';

class HiddenInput extends FormElement {
  triggerChange() {}

  componentDidUpdate(prevProps) {
    super.componentDidUpdate(prevProps);

    const incoming = this.props.properties.default;
    if (incoming !== this.state.value) {
      this.setState({ value: incoming }, () => this.triggerValidate());
    }
  }

  render() {
    return null;
  }
}

HiddenInput.propTypes = {
  properties: PropTypes.object.isRequired,
  validations: PropTypes.array,
};

export default injectIntl(HiddenInput, { forwardRef: true });
