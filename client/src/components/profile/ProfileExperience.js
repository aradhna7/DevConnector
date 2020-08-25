import React from 'react'
import PropTypes from 'prop-types';
import {connect } from 'react-redux';
import Moment from 'react-moment';

const ProfileExperience = ({experience:{ company, location, title, current, from, to, description}}) => {
    return (
        <div>
            <h3 class="text-dark">{company}</h3>
            <p><Moment format='YYYY/MM/DD'>{from}</Moment> - {current ? ('Now') : (<Moment format='YYYY/MM/DD'>{to}</Moment>)}</p>
            <p><strong>Position: </strong>{title}</p>
            
            {description && (
                <p>
                <strong>Description: </strong>{description}
                </p>
            )}
          </div>
    )
}

ProfileExperience.propTypes = {
    experience: PropTypes.object.isRequired,
}

export default ProfileExperience;
