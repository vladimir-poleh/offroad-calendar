import React, { Component } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import moment from 'moment';
import Calendar from './calendar';

const CALENDAR_ID = 'dda9q2ui2pt8qerj9dk6t5npbo@group.calendar.google.com';
const API_KEY = 'AIzaSyBjEOL_oeuRA5x2RB52NjvtHoucvjOEa3g';

const styles = theme => ({
    root: {
        width: '100%',
    },
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
    title: {
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing.unit,
            width: 'auto',
        },
    },
    searchIcon: {
        width: theme.spacing.unit * 5,
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
        width: '100%',
    },
    inputInput: {
        paddingTop: theme.spacing.unit,
        paddingRight: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
        paddingLeft: theme.spacing.unit * 5,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: 120,
            '&:focus': {
                width: 200,
            },
        },
    },
    yearControl: {
        color: 'inherit',
        paddingLeft: theme.spacing.unit,
        margin: theme.spacing.unit,
        minWidth: 120,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
    },
    container: {
        marginTop: '64px',
        padding: theme.spacing.unit
    }
});

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            events: [],
            years: [],
            year: '',
            filter: ''
        };
    }

    componentDidMount() {
        this.loadData();
    }

    render() {
        const { classes } = this.props;
        const { events, year, filter } = this.state;

        const content = events && events.length
            ? <Calendar events={events} year={year} filter={filter} />
            : <div>Нет данных</div>;

        const years = this.state.years.map((year) => <MenuItem value={year} key={year}>{year}</MenuItem>);

        return (
            <div>
                <AppBar position="fixed">
                    <Toolbar>
                        <Typography variant="h6" color="inherit">Календарь</Typography>
                        <div>
                            <Select className={classes.yearControl}
                                value={this.state.year}
                                onChange={this.handleYearChange}
                                name="year"
                                displayEmpty
                            >
                                <MenuItem value="">Весь</MenuItem>
                                {years}
                            </Select>
                        </div>
                        <div className={classes.grow} />
                        <div className={classes.search}>
                            <div className={classes.searchIcon}>
                                <SearchIcon />
                            </div>
                            <InputBase
                                placeholder="Поиск..."
                                classes={{
                                    root: classes.inputRoot,
                                    input: classes.inputInput,
                                }}
                                onChange={this.handleSearchChange}
                            />
                        </div>
                    </Toolbar>
                </AppBar>
                <div className={classes.container}>
                    {content}
                </div>
            </div>
        );
    }

    handleYearChange = (event) => {
        this.setState({ year: event.target.value });
        window.scroll(0, 0);
    }

    handleSearchChange = (event) => {
        this.setState({ filter: event.target.value.trim() });
    }

    loadData() {
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}`;
        const http = new XMLHttpRequest();
        http.open('GET', url);
        http.addEventListener('load', () => {
            const response = JSON.parse(http.response);

            if (response.items) {
                const events = response.items
                    .filter(i => i.kind === 'calendar#event')
                    .map(this.mapCalendarEvent);

                events.sort((a, b) => {
                    return a.start < b.start ? -1 : a.start > b.start ? 1 : 0;
                });

                const years = [];
                for (let i = 0; i < events.length; i++) {
                    const year = events[i].start.year();
                    if (years.indexOf(year) === -1) {
                        years.push(year);
                    }
                }

                let year = '';
                if (years.length > 0) {
                    const currentYear = moment().year();
                    year = years.indexOf(currentYear) === -1 ? years[years.length - 1] : currentYear;
                }

                this.setState({ events: events, years: years, year: year });
            }
        });

        http.send();
    }

    mapCalendarEvent(event) {
        const now = moment();
        const cancelled = !!event.summary.match(/^\s*отмена!/i);
        let forumLink = null;

        if (event.description) {
            const links = event.description.match(/https?:\/\/[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/);
            const forumLinks = event.description.match(/https?:\/\/4x4forum\.by\/\S+?\.html/);
            forumLink = forumLinks ? forumLinks[0] : links ? links[0] : null
        }

        const start = moment(event.start.date);
        const end = moment(event.end.date);

        return {
            etag: event.etag,
            calendarLink: event.htmlLink,
            summary: event.summary,
            description: event.description,
            location: event.location,
            start: start,
            end: end,
            cancelled: cancelled,
            started: start < now,
            forumLink: forumLink
        }
    }
}

export default withStyles(styles)(App);
