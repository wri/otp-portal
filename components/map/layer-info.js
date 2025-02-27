import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

import Html from 'components/html';

const LayerInfo = ({ metadata, intl }) => {
  const intlWithHTML = (id) =>
    intl.formatMessage({ id }, {
      h4: chunks => `<h4>${chunks}</h4>`,
      p: chunks => `<p>${chunks}</p>`
    })

  return (
    <div className="c-layer-info">
      <h2 className="c-layer-info__title">
        {intl.formatMessage({ id: metadata.title })} {metadata.dateOfContent && `(${metadata.dateOfContent})`}
      </h2>
      <p className="c-layer-info__subtitle">{intlWithHTML(metadata.subtitle)}</p>
      <div className="c-layer-info__overview">
        <h3>{intl.formatMessage({ id: 'overview' })}</h3>
        <Html html={intlWithHTML(metadata.overview)} linkify />
      </div>

      <div className="c-layer-info__source">
        <h3>{intl.formatMessage({ id: 'source' })}</h3>
        <Html html={intlWithHTML(metadata.source)} linkify />
      </div>
    </div>
  )
}

LayerInfo.propTypes = {
  intl: PropTypes.object.isRequired,
  metadata: PropTypes.object.isRequired
}

export default injectIntl(LayerInfo);
