import React from 'react';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import { getOperators } from 'modules/operators';

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
          column={4}
        >
          <Card
            theme="-secondary"
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
          column={4}
        >
          <Card
            theme="-tertiary"
            letter="B"
            title={this.props.intl.formatMessage({ id: 'home.card.b.title' })}
            description={this.props.intl.formatMessage({ id: 'home.card.b.description' })}
            link={{
              label: this.props.intl.formatMessage({ id: 'home.card.b.link.label' }),
              href: '/operators'
            }}
          />
        </StaticSection>

        {/* SECTION C */}
        <StaticSection
          background="/static/images/home/bg-c.jpg"
          position={{ top: true, left: true }}
          column={4}
        >
          <Card
            theme="-secondary"
            letter="C"
            title={this.props.intl.formatMessage({ id: 'home.card.c.title' })}
            description={this.props.intl.formatMessage({ id: 'home.card.c.description' })}
            link={{
              label: this.props.intl.formatMessage({ id: 'home.card.c.link.label' }),
              href: '/operators'
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


export default withIntl(withRedux(
  store,
  state => ({
    operators: state.operators
  }),
  { getOperators }
)(HomePage));
