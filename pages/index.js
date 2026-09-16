import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

// Intl
import { useIntl } from 'react-intl';

// Services
import modal from 'services/modal';

// Components
import Layout from 'components/layout/layout';
import StaticSection from 'components/ui/static-section';
import Card from 'components/ui/card';
import Search from 'components/ui/search';
import DynamicLoading from 'components/ui/dynamic-loading';

const Login = dynamic(() => import('components/ui/login'), { ssr: false, loading: DynamicLoading });

const HomePage = () => {
  const intl = useIntl();
  const router = useRouter();

  // the API redirects here after unlocking an account
  useEffect(() => {
    if (!router.isReady || router.query.message !== 'user_unlocked') return;

    modal.toggleModal(true, {
      children: Login,
      childrenProps: {
        notice: {
          title: intl.formatMessage({ id: 'login.unlocked.title', defaultMessage: 'Account unlocked' }),
          message: intl.formatMessage({ id: 'login.unlocked.message', defaultMessage: 'Your account has been unlocked, you can sign in again.' })
        }
      }
    });

    // drop the param, so the modal doesn't show up again on reload
    const { message, ...query } = router.query;
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  }, [router.isReady, router.query.message]);

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
        backgroundProps={{ fetchpriority: 'high' }}
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
        backgroundProps={{ fetchpriority: 'low', loading: 'lazy' }}
      >
        <Card
          theme="-tertiary -theme-home"
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
        backgroundProps={{ fetchpriority: 'low', loading: 'lazy' }}
      >
        <Card
          theme="-secondary -theme-home"
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
