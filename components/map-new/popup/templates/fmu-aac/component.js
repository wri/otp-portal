import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

// Intl
import { injectIntl, intlShape } from 'react-intl';

import { format } from 'd3-format';
import moment from 'moment';

// Utils
import { encode } from 'utils/general';

class FMUAACTemplatePopup extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired
  };

  render() {
    return (
      <div className="c-layer-popup">
        This is the template for AAC nad FMU detail
      </div>
    );
  }
}

export default injectIntl(FMUAACTemplatePopup);
