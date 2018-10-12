import { Components, registerComponent, withCurrentUser, withMutation, withMessages } from 'meteor/vulcan:core';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'meteor/vulcan:i18n';
import Formsy from 'formsy-react';
import { Input } from 'formsy-react-components';
import Users from 'meteor/vulcan:users';
import Cookies from 'universal-cookie';
import request from 'request';
const cookies = new Cookies();

class Newsletter extends PureComponent {

  constructor(props, context) {
    super(props);
    this.subscribeEmail = this.subscribeEmail.bind(this);
    this.successCallbackSubscription = this.successCallbackSubscription.bind(this);
    this.dismissBanner = this.dismissBanner.bind(this);

    this.state = {
      showBanner: false
    };
  }

  componentDidMount() {
    this.setState({
      showBanner: showBanner(this.props.currentUser)
    });
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.currentUser) {
      this.setState({showBanner: showBanner(nextProps.currentUser)});
    }
  }

  async subscribeEmail(data) {
    try {
      console.log(data.email); // eslint-disable-line no-console
      const result = await this.addEmail(data.email);
      this.successCallbackSubscription(result);
    } catch(error) {
      const graphQLError = error.graphQLErrors[0];
      console.error(graphQLError); // eslint-disable-line no-console
      this.props.flash({id: `newsletter.error_${this.state.error.name}`, message: this.state.error.message, type: 'error'});
    }
  }

  addEmail(email){
    request({
      url: 'https://us19.api.mailchimp.com/3.0/Lists/174f2cceb3',
      method: 'POST',
      json: {"email_address": email,
              "status": "pending",
              "merge_fields":{"FNAME":"Test", "LNAME": "Blog"}

    },
      user: "07e93d4e3b6de36a1d2cc2add67d9ea8"
    }, function(error, response, body){
      /* eslint-disable no-console */
      console.log(body);
    });
  }

  successCallbackSubscription(/* result*/) {
    this.props.flash({ id: 'newsletter.success_message', type: 'success' });
    this.dismissBanner();
  }

  dismissBanner(e) {
    if (e && e.preventDefault) e.preventDefault();

    this.setState({showBanner: false});

    // set cookie to keep the banner dismissed persistently
    //cookies.set('showBanner', 'no');
  }

  renderButton() {
    return (
        <Components.NewsletterButton
            label="newsletter.subscribe"
            mutationName="addUserNewsletter"
            successCallback={() => this.successCallbackSubscription()}
            user={this.props.currentUser}
            onClick={this.subscribeEmail}
        />
    );
  }

  renderForm() {
    return (
      <Formsy.Form className="newsletter-form" onSubmit={this.subscribeEmail}>
        <Input
          name="email"
          value=""
          placeholder={this.context.intl.formatMessage({id: "newsletter.email"})}
          type="text"
          layout="elementOnly"
        />
        <Components.Button className="newsletter-button" type="submit" variant="primary"><FormattedMessage id="newsletter.subscribe"/></Components.Button>
      </Formsy.Form>
    )
  }

  render() {
    return this.state.showBanner
      ? (
        <div className="newsletter">
          <h4 className="newsletter-tagline"><FormattedMessage id="newsletter.subscribe_prompt"/></h4>
          {this.props.currentUser ? this.renderButton() : this.renderForm()}
          <a onClick={this.dismissBanner} className="newsletter-close"><Components.Icon name="close"/></a>
        </div>
      ) : null;
  }
}

Newsletter.contextTypes = {
  actions: PropTypes.object,
  intl: intlShape
};

const mutationOptions = {
  name: 'addEmailNewsletter',
  args: { email: 'String' }
}

function showBanner (user) {
  return (
    // showBanner cookie either doesn't exist or is not set to "no"
   
    // and user is not subscribed to the newsletter already (setting either DNE or is not set to false)
   !Users.getSetting(user, 'newsletter_subscribeToNewsletter', false)
  );
}

registerComponent({ name: 'Newsletter', component: Newsletter, hocs: [withMutation(mutationOptions), withCurrentUser, withMessages] });
