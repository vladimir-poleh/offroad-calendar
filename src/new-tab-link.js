import React, { Component } from 'react';
import Link from '@material-ui/core/Link';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({});

class NewTabLink extends Component {
    render() {
        return (
            <Link href={this.props.href} target='_blank' rel='noopener noreferrer'>{this.props.title}</Link>
        );
    }
}

export default withStyles(styles)(NewTabLink);
