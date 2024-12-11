import React from 'react';

// Intl
import { useIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticSection from 'components/ui/static-section';
import Card from 'components/ui/card';
import Search from 'components/ui/search';

const HomePage = () => {
  const intl = useIntl();

  return (
    <Layout
      title="Home"
      description="Home description..."
    >
      {/* INTRO */}
      <StaticSection
        background="/static/images/home/bg-intro.jpg"
        position={{ bottom: true, left: true }}
        column={9}
        backgroundProps={{ fetchPriority: 'high' }}
      >
        <div className="c-intro">
          <h2>
            {intl.formatMessage({ id: 'home.intro' }, { span: (...chunks) => <span>{chunks}</span> })}
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
          title={intl.formatMessage({ id: 'home.card.a.title' })}
          description={intl.formatMessage({
            id: 'home.card.a.description'
          })}
          descriptionTruncateLines={0}
          link={{
            label: intl.formatMessage({
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
        backgroundProps={{ fetchPriority: 'low', loading: 'lazy' }}
      >
        <Card
          theme="-tertiary -theme-home"
          letter="B"
          title={intl.formatMessage({ id: 'home.card.b.title' })}
          description={intl.formatMessage({
            id: 'home.card.b.description'
          })}
          descriptionTruncateLines={0}
          link={false}
          Component={<Search theme="-theme-static" />}
        />
      </StaticSection>

      {/* SECTION C */}
      <StaticSection
        position={{ top: true, left: true }}
        column={5}
        background="/static/images/home/bg-c.jpg"
        backgroundProps={{ fetchPriority: 'low', loading: 'lazy' }}
      >
        <Card
          theme="-secondary -theme-home"
          letter="C"
          title={intl.formatMessage({ id: 'home.card.c.title' })}
          description={intl.formatMessage({
            id: 'home.card.c.description'
          })}
          descriptionTruncateLines={0}
          link={{
            label: intl.formatMessage({
              id: 'home.card.c.link.label'
            }),
            href: '/observations'
          }}
        />
      </StaticSection>
    </Layout>
  );
}

export default HomePage;
