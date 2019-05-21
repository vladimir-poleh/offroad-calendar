import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import { withStyles } from '@material-ui/core/styles';
import CalendarEvent from './calendar-event'

const styles = theme => ({
    root: {
        width: '100%',
        overflowX: 'auto',
    },
    table: {
        minWidth: 700,
    },
});

class Calendar extends Component {
    constructor(props) {
        super(props);

        this.eventRefs = {};
        this.nextEvent = undefined;
    }

    render() {
        const { classes } = this.props;

        const year = this.props.year;
        const filter = this.props.filter.toLowerCase();
        let events = this.props.events;

        if (year) {
            events = events.filter((event) => event.start.year() === year);
        }

        if (filter) {
            events = events.filter((event) => event.summary.toLowerCase().indexOf(filter) !== -1)
        }

        this.nextEvent = events.find(event => !event.started || event.current);

        const calendarEvents = events.map((event) => <CalendarEvent key={event.etag} event={event} innerRef={this.eventRefs[event.etag] = React.createRef()} />);

        return (
            <Paper className={classes.root}>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Дата проведения</TableCell>
                            <TableCell>Мероприятие</TableCell>
                            <TableCell>Место проведения</TableCell>
                            <TableCell>Календарь</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {calendarEvents}
                    </TableBody>
                </Table>
            </Paper>
        );
    }

    componentDidMount() {
        this.scrollToNextEvent();
    }

    componentDidUpdate() {
        this.scrollToNextEvent();
    }

    scrollToNextEvent() {
        if (this.nextEvent) {
            this.eventRefs[this.nextEvent.etag].current.scrollTo();
        }
    }
}

export default withStyles(styles)(Calendar);
