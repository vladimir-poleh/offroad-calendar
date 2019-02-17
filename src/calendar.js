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
    render() {
        const { classes } = this.props;

        const year = this.props.year;
        const calendarEvents = this.props.events
            .filter((event) => event.start.year() === year)
            .map((event) => <CalendarEvent key={event.etag} event={event} />);

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
}

export default withStyles(styles)(Calendar);
