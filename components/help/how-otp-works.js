import React from 'react';
import MoveTo from 'moveto';
import { StickyContainer, Sticky } from 'react-sticky';

export default class HelpHowOTPWorks extends React.Component {

  constructor(props) {
    super(props);

    this.moveTo = new MoveTo({
      tolerance: 50,
      duration: 500,
      easing: 'easeOutQuart'
    });
  }

  triggerClick(selector) {
    const target = document.querySelector(selector);
    this.moveTo.move(target);
  }

  render() {
    return (
      <div
        className="c-help-section"
      >
        <div className="l-container">
          <StickyContainer>
            <div className="row custom-row">
              <div className="columns small-12 medium-3">
                <Sticky>
                  {
                    ({ style }) => (
                      <aside className="c-aside" style={style}>
                        <h3>How OTP Works</h3>
                        <nav>
                          <ul>
                            <li onClick={() => this.triggerClick('#understanding-the-platform')}>Understanding the platform</li>
                            <li onClick={() => this.triggerClick('#how-the-score-is-calculated')}>How the score is calculated</li>
                            <li onClick={() => this.triggerClick('#understanding-third-card')}>Understanding. Third card</li>
                          </ul>
                        </nav>
                      </aside>
                    )
                  }
                </Sticky>
              </div>

              <div className="columns small-12 medium-8 medium-offset-1">
                <article id="understanding-the-platform" className="c-article">
                  <header>
                    <h2 className="c-title">Understanding the platform</h2>
                  </header>
                  <div className="content">
                    <p>Sociis natoque penatibus et magnis dis parturient montes,
                       nascetur ridiculus mus.
                      Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
                      Etiam porta sem malesuada magna mollis euismod. Donec id elit non mi
                       porta gravida at eget metus.
                      Nullam id dolor id ultricies vehicula ut id elit.</p>
                    <p>Sociis natoque penatibus et magnis dis parturient montes,
                       nascetur ridiculus mus.
                      Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
                      Etiam porta sem malesuada magna mollis euismod. Donec id elit non mi
                       porta gravida at eget metus.
                      Nullam id dolor id ultricies vehicula ut id elit.</p>
                    <img src="/static/images/static-header/bg-help.jpg" alt="Understanding the platform" />
                  </div>
                </article>

                <article id="how-the-score-is-calculated" className="c-article">
                  <header>
                    <h2 className="c-title">How the score is calculated</h2>
                  </header>
                  <div className="content">
                    <p>Sociis natoque penatibus et magnis dis parturient montes,
                      nascetur ridiculus mus.
                      Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
                      Etiam porta sem malesuada magna mollis euismod.
                      Donec id elit non mi porta gravida at eget metus.
                      Nullam id dolor id ultricies vehicula ut id elit.</p>
                    <p>Sociis natoque penatibus et magnis dis parturient montes,
                      nascetur ridiculus mus.
                      Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
                      Etiam porta sem malesuada magna mollis euismod.
                      Donec id elit non mi porta gravida at eget metus.
                      Nullam id dolor id ultricies vehicula ut id elit.</p>
                    <img src="/static/images/static-header/bg-help.jpg" alt="Understanding the platform" />
                  </div>
                </article>

                <article id="understanding-third-card" className="c-article">
                  <header>
                    <h2 className="c-title">Understanding third card</h2>
                  </header>
                  <div className="content">
                    <p>Sociis natoque penatibus et magnis dis parturient montes,
                      nascetur ridiculus mus.
                      Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
                      Etiam porta sem malesuada magna mollis euismod.
                      Donec id elit non mi porta gravida at eget metus.
                      Nullam id dolor id ultricies vehicula ut id elit.</p>
                    <img src="/static/images/static-header/bg-help.jpg" alt="Understanding the platform" />
                  </div>
                </article>

              </div>
            </div>
          </StickyContainer>
        </div>
      </div>
    );
  }
}

HelpHowOTPWorks.propTypes = {
};
