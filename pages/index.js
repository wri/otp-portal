import React from 'react';
import PropTypes from 'prop-types';
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import { getObservators } from 'modules/observators';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticSection from 'components/page/static-section';
import Card from 'components/ui/card';

class HomePage extends Page {

  componentWillMount() {
    // Example: how to use redux
    this.props.dispatch(getObservators());
  }

  render() {
    const { url, session } = this.props;

    return (
      <Layout
        title="Home"
        description="Home description..."
        url={url}
        session={session}
      >
        {this.props.observators.list.map(observator => <p>{observator.title}</p>)}

        <StaticSection
          background="/static/images/home/bg-intro.jpg"
          position={{ bottom: true, left: true }}
          column={9}
        >
          <div className="c-intro">
            <h2>Level the playing field between good and bad forest products
              by a <span>legality</span> and <span>sustainability criteria.</span></h2>
          </div>
        </StaticSection>

        <StaticSection
          background="/static/images/home/bg-a.jpg"
          position={{ top: true, left: true }}
          column={4}
        >
          <Card
            theme="-theme-secondary"
            letter="A"
            title="Operator transparency rankings"
            description="Visualize and refine transparency rankings by country or by operator type"
            link="/operators"
          />
        </StaticSection>

        <StaticSection
          background="/static/images/home/bg-b.jpg"
          position={{ top: true, right: true }}
          column={4}
        >
          <Card
            letter="B"
            title="Operator profiles"
            description="Explore the profiles of specific operators, view documents provided and observations from Independent Monitors"
            link="/operators"
          />
        </StaticSection>

        <StaticSection
          background="/static/images/home/bg-c.jpg"
          position={{ top: true, left: true }}
          column={4}
        >
          <Card
            theme="-theme-secondary"
            letter="C"
            title="Forest Management Units"
            description="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore."
            link="/operators"
          />
        </StaticSection>
      </Layout>
    );
  }

}

HomePage.propTypes = {
  session: PropTypes.object.isRequired
};

export default withRedux(
  store,
  state => ({
    observators: state.observators
  })
)(HomePage);
