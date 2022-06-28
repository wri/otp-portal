import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import * as Cookies from 'js-cookie';

// Toastr
import { toastr } from 'react-redux-toastr';

import withTracker from 'components/layout/with-tracker';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Services
import modal from 'services/modal';

// Components
import Layout from 'components/layout/layout';
import StaticSection from 'components/ui/static-section';
import Card from 'components/ui/card';
import Map from 'components/map-new';
import LayerManager from 'components/map-new/layer-manager';
import FAAttributions from 'components/map-new/fa-attributions';
import Search from 'components/ui/search';

class HomePage extends React.Component {
  static async getInitialProps({ url }) {
    return { url };
  }
  /**
   * COMPONENT LIFECYCLE
  */
  componentDidMount() {
    // if (!Cookies.get('home.disclaimer')) {
    //   toastr.info(
    //     'Info',
    //     this.props.intl.formatMessage({ id: 'home.disclaimer' }),
    //     {
    //       id: 'home.disclaimer',
    //       className: '-disclaimer',
    //       position: 'bottom-right',
    //       timeOut: 0,
    //       onCloseButtonClick: () => {
    //         Cookies.set('home.disclaimer', true);
    //       }
    //     }
    //   );
    // }
  }

  componentWillUnMount() {
    // toastr.remove('home.disclaimer');

    // Attribution listener
    document.getElementById('forest-atlas-attribution').removeEventListener('click', this.onCustomAttribute);
  }

  onCustomAttribute = (e) => {
    e.preventDefault();
    modal.toggleModal(true, {
      children: FAAttributions
    });
  }


  render() {
    const { url } = this.props;

    return (
      <Layout
        title="Home"
        description="Home description..."
        url={url}
      >
        {/* INTRO */}
        <StaticSection
          background="/static/images/home/bg-intro.jpg"
          position={{ bottom: true, left: true }}
          column={9}
        >
          <div className="c-intro">
            <h2
              dangerouslySetInnerHTML={{
                __html: this.props.intl.formatHTMLMessage({ id: 'home.intro' })
              }}
            />
          </div>
        </StaticSection>

        {/* SECTION A */}
        <StaticSection
          background="/static/images/home/bg-a.jpg"
          position={{ top: true, left: true }}
          column={5}
        >
          <Card
            theme="-secondary -theme-home"
            letter="A"
            title={this.props.intl.formatMessage({ id: 'home.card.a.title' })}
            description={this.props.intl.formatMessage({
              id: 'home.card.a.description'
            })}
            link={{
              label: this.props.intl.formatMessage({
                id: 'home.card.a.link.label'
              }),
              href: '/operators'
            }}
          />
        </StaticSection>

        {/* SECTION B */}
        <StaticSection
          position={{ top: true, right: true }}
          column={5}
          background="/static/images/home/bg-map.jpg"
        >
          <Card
            theme="-tertiary -theme-home"
            letter="B"
            title={this.props.intl.formatMessage({ id: 'home.card.b.title' })}
            description={this.props.intl.formatMessage({
              id: 'home.card.b.description'
            })}
            link={false}
            Component={<Search theme="-theme-static" />}
          />
        </StaticSection>

        {/* SECTION C */}
        <StaticSection
          background="/static/images/home/bg-c.jpg"
          position={{ top: true, left: true }}
          column={5}
        >
          <Card
            theme="-secondary -theme-home"
            letter="C"
            title={this.props.intl.formatMessage({ id: 'home.card.c.title' })}
            description={this.props.intl.formatMessage({
              id: 'home.card.c.description'
            })}
            link={{
              label: this.props.intl.formatMessage({
                id: 'home.card.c.link.label'
              }),
              href: '/observations'
            }}
          />
        </StaticSection>
      </Layout>
    );
  }
}

HomePage.propTypes = {
  url: PropTypes.shape({}).isRequired,
  intl: intlShape.isRequired
};


export default withTracker(withIntl(HomePage));
