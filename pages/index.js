import React from 'react';

// Redux
import { connect } from 'react-redux';
import { getOperators } from 'modules/operators';
import withTracker from 'components/layout/with-tracker';

import * as Cookies from 'js-cookie';

// Toastr
import { toastr } from 'react-redux-toastr';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Constants
import { MAP_OPTIONS_HOME, MAP_LAYERS_HOME } from 'constants/home';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticSection from 'components/ui/static-section';
import Card from 'components/ui/card';
import Map from 'components/map/map';
import Search from 'components/ui/search';

class HomePage extends Page {
  /**
   * COMPONENT LIFECYCLE
  */
  componentDidMount() {
    const { operators } = this.props;

    if (!operators.data.length) {
      // Get operators
      this.props.getOperators();
    }

    if (!Cookies.get('home.disclaimer')) {
      toastr.info(
        'Info',
        this.props.intl.formatMessage({ id: 'home.disclaimer' }),
        {
          id: 'home.disclaimer',
          className: '-disclaimer',
          position: 'bottom-right',
          timeOut: 0,
          onCloseButtonClick: () => {
            Cookies.set('home.disclaimer', true);
          }
        }
      );
    }
  }

  componentWillUnMount() {
    toastr.remove('home.disclaimer');
  }

  render() {
    const { url } = this.props;

    return (
      <Layout
        title="Home"
        description="Home description..."
        url={url}
        searchList={this.props.operators.data}
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
            description={this.props.intl.formatMessage({ id: 'home.card.a.description' })}
            link={{
              label: this.props.intl.formatMessage({ id: 'home.card.a.link.label' }),
              href: '/operators'
            }}
          />
        </StaticSection>

        {/* SECTION B */}
        <StaticSection
          map={{
            component: Map,
            props: {
              mapOptions: MAP_OPTIONS_HOME,
              layers: MAP_LAYERS_HOME
            }
          }}
          position={{ top: true, right: true }}
          column={5}
        >
          <Card
            theme="-tertiary -theme-home"
            letter="B"
            title={this.props.intl.formatMessage({ id: 'home.card.b.title' })}
            description={this.props.intl.formatMessage({ id: 'home.card.b.description' })}
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
            description={this.props.intl.formatMessage({ id: 'home.card.c.description' })}
            link={{
              label: this.props.intl.formatMessage({ id: 'home.card.c.link.label' }),
              href: '/observations'
            }}
          />
        </StaticSection>
      </Layout>
    );
  }
}

HomePage.propTypes = {
  intl: intlShape.isRequired
};


export default withTracker(withIntl(connect(
  state => ({
    operators: state.operators
  }),
  { getOperators }
)(HomePage)));
