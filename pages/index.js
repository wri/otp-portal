import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { injectIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticSection from 'components/ui/static-section';
import Card from 'components/ui/card';
import Search from 'components/ui/search';

class HomePage extends React.Component {
  static async getInitialProps({ url }) {
    return { url };
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
            <h2>
              {this.props.intl.formatMessage({ id: 'home.intro' }, { span: (...chunks) => <span>{chunks}</span> })}
            </h2>
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
            descriptionTruncateLines={0}
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
            descriptionTruncateLines={0}
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
            descriptionTruncateLines={0}
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
  intl: PropTypes.object.isRequired
};


export default injectIntl(HomePage);
