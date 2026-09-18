import React from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import { useIntl } from 'react-intl';

import Icon from 'components/ui/icon';
import DynamicLoading from 'components/ui/dynamic-loading';
import modal from 'services/modal';

// ssr:false - pages-router dynamic() with SSR breaks hydration under Turbopack.
const SearchModal = dynamic(() => import('components/ui/search-modal'), { ssr: false, loading: DynamicLoading });

const SearchTrigger = ({ theme }) => {
  const intl = useIntl();

  return (
    <div className={`c-search ${theme}`}>
      <button
        type="button"
        className="search search-trigger"
        data-test-id="search-trigger"
        onClick={() => modal.toggleModal(true, { children: SearchModal, size: '-search' })}
      >
        <Icon name="icon-search" />
        <span>{intl.formatMessage({ id: 'search.trigger', defaultMessage: 'Search' })}</span>
      </button>
    </div>
  );
};

SearchTrigger.propTypes = {
  theme: PropTypes.string
};

SearchTrigger.defaultProps = {
  theme: ''
};

export default SearchTrigger;
