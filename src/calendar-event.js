import React, { Component } from 'react';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import RootRef from '@material-ui/core/RootRef';
import { withStyles } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';
import grey from '@material-ui/core/colors/grey';
import green from '@material-ui/core/colors/green';
import NewTabLink from './new-tab-link';

const styles = theme => ({
    cancelled: {
        backgroundColor: red[100]
    },
    started: {
        backgroundColor: grey[100]
    },
    current: {
        backgroundColor: green[100]
    }
});

class CalendarEvent extends Component {
    constructor(props) {
        super(props);

        this.rootRef = React.createRef();
    }

    render() {
        const { classes, event } = this.props;

        let className;
        if (event.cancelled) {
            className = classes.cancelled;
        } else if (event.current) {
            className = classes.current;
        } else if (event.started) {
            className = classes.started;
        }

        let startDate = event.start.format('LL');
        if (!event.started) {
            startDate = `${startDate} (${event.start.fromNow()})`
        }

        const summary = event.forumLink
            ? <NewTabLink href={event.forumLink} title={event.summary} />
            : event.summary;

        let location = '';
        if (event.location) {
            const locationUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;
            location = <NewTabLink href={locationUrl} title={event.location} />
        }

        return (
            <RootRef rootRef={this.rootRef}>
                <TableRow className={className}>
                    <TableCell>{startDate}</TableCell>
                    <TableCell>{summary}</TableCell>
                    <TableCell>{location}</TableCell>
                    <TableCell><NewTabLink href={event.calendarLink} title='Открыть' /></TableCell>
                </TableRow>
            </RootRef>
        );
    }

    scrollTo() {
        window.scrollTo(0, this.rootRef.current.offsetTop);
    }
}

export default withStyles(styles)(CalendarEvent);
