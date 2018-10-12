import { registerComponent } from 'meteor/vulcan:core';
import React from 'react';
import { IndexLink } from 'react-router';

const Logo = ({logoUrl, siteTitle}) => {
    return (
      <h1 >
        <IndexLink to={{pathname: "/"}}>Jonathan and Brian's Blog</IndexLink>
      </h1>
    )
  }


Logo.displayName = "Logo";

registerComponent({ name: 'Logo', component: Logo });