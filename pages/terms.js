import React from 'react';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import withTracker from 'components/layout/with-tracker';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';

class TermsPage extends Page {

  render() {
    const { url } = this.props;

    return (
      <Layout
        title="Terms of service"
        description="Terms of service"
        url={url}
      >
        <StaticHeader
          title={this.props.intl.formatMessage({ id: 'terms.title' })}
          background="/static/images/static-header/bg-about.jpg"
        />

        <div className="c-section">
          <div className="l-container">
            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'terms.privacypolicy.title' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <p>{this.props.intl.formatMessage({ id: 'terms.privacypolicy.description1' })}</p>
                      <p>{this.props.intl.formatMessage({ id: 'terms.privacypolicy.description2' })}</p>
                      <p>{this.props.intl.formatMessage({ id: 'terms.privacypolicy.description3' })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'terms.whatinformation.title' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <p>{this.props.intl.formatMessage({ id: 'terms.whatinformation.description1' })}</p>
                      <p>{this.props.intl.formatMessage({ id: 'terms.whatinformation.description2' })}</p>
                      <p>{this.props.intl.formatMessage({ id: 'terms.whatinformation.description3' })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'terms.whycollect.title' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <p
                        dangerouslySetInnerHTML={{
                          __html: this.props.intl.formatHTMLMessage({ id: 'terms.whycollect.description' })
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'terms.whycollect.title' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <p>{this.props.intl.formatMessage({ id: 'terms.shareinformation.description1' })}</p>
                      <ul
                        dangerouslySetInnerHTML={{
                          __html: this.props.intl.formatHTMLMessage({ id: 'terms.shareinformation.description2' })
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'terms.security.title' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <p
                        dangerouslySetInnerHTML={{
                          __html: this.props.intl.formatHTMLMessage({ id: 'terms.security.description' })
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'terms.trackingtechnology.title' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <p
                        dangerouslySetInnerHTML={{
                          __html: this.props.intl.formatHTMLMessage({ id: 'terms.trackingtechnology.description1' })
                        }}
                      />
                      <p
                        dangerouslySetInnerHTML={{
                          __html: this.props.intl.formatHTMLMessage({ id: 'terms.trackingtechnology.description2' })
                        }}
                      />
                      <p
                        dangerouslySetInnerHTML={{
                          __html: this.props.intl.formatHTMLMessage({ id: 'terms.trackingtechnology.description3' })
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'terms.cookies.title' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <p
                        dangerouslySetInnerHTML={{
                          __html: this.props.intl.formatHTMLMessage({ id: 'terms.cookies.description' })
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'terms.choices.title' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <p
                        dangerouslySetInnerHTML={{
                          __html: this.props.intl.formatHTMLMessage({ id: 'terms.choices.description1' })
                        }}
                      />
                      <p
                        dangerouslySetInnerHTML={{
                          __html: this.props.intl.formatHTMLMessage({ id: 'terms.choices.description2' })
                        }}
                      />
                      <p
                        dangerouslySetInnerHTML={{
                          __html: this.props.intl.formatHTMLMessage({ id: 'terms.choices.description3' })
                        }}
                      />
                      <p
                        dangerouslySetInnerHTML={{
                          __html: this.props.intl.formatHTMLMessage({ id: 'terms.choices.description4' })
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'terms.updates.title' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <p>{this.props.intl.formatMessage({ id: 'terms.updates.description' })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="c-article"
            >
              <div className="row l-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">{this.props.intl.formatMessage({ id: 'terms.contact.title' })}</h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <p>{this.props.intl.formatMessage({ id: 'terms.contact.description1' })}</p>
                      <p
                        dangerouslySetInnerHTML={{
                          __html: this.props.intl.formatHTMLMessage({ id: 'terms.contact.description2' })
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </Layout>
    );
  }

}

TermsPage.propTypes = {
  intl: intlShape.isRequired
};

export default withTracker(withIntl(withRedux(
  store,
  state => ({

  })
)(TermsPage)));
