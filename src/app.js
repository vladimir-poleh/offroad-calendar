import React, { Component } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';
import Calendar from './calendar';
import Utils from './utils';

const CALENDAR_ID = 'dda9q2ui2pt8qerj9dk6t5npbo@group.calendar.google.com';
const API_KEY = 'AIzaSyBjEOL_oeuRA5x2RB52NjvtHoucvjOEa3g';

const styles = theme => ({
    root: {
        width: '100%',
    },
    appBar: {
        backgroundColor: '#cadceb',
        color: '#105289',
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
        backgroundColor: theme.palette.common.white,
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
    },
    searchIcon: {
        width: theme.spacing(5),
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
        paddingTop: theme.spacing(1),
        paddingRight: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        paddingLeft: theme.spacing(5),
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
        paddingLeft: theme.spacing(1),
        margin: theme.spacing(1),
        minWidth: 120,
        backgroundColor: theme.palette.common.white,
    },
    container: {
        marginTop: '64px',
        padding: theme.spacing(1),
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
                <AppBar position="fixed" className={classes.appBar}>
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

    loadData(previous, pageToken) {
        if (!previous) {
            previous = [];
        }

        let url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}`;
        if (pageToken) {
            url = `${url}&pageToken=${encodeURIComponent(pageToken)}`
        }

        const http = new XMLHttpRequest();
        http.open('GET', url);
        http.addEventListener('load', () => {
            const response = JSON.parse(http.response);
            let result = [...previous]

            if (response.items) {
                const events = response.items
                    .filter(i => i.kind === 'calendar#event')
                    .map(this.mapCalendarEvent);

                result = [...result, ...events]
            }

            if (response.nextPageToken) {
                this.loadData(result, response.nextPageToken);
            } else {
                result.sort((a, b) => {
                    return a.start < b.start ? -1 : a.start > b.start ? 1 : 0;
                });

                const years = [];
                for (let i = 0; i < result.length; i++) {
                    const year = result[i].start.year();
                    if (years.indexOf(year) === -1) {
                        years.push(year);
                    }
                }

                let year = '';
                if (years.length > 0) {
                    const currentYear = moment().year();
                    year = years.indexOf(currentYear) === -1 ? years[years.length - 1] : currentYear;
                }

                this.setState({ events: result, years: years, year: year });
            }
        });

        http.send();
    }

    mapCalendarEvent(event) {
        const now = moment();
        const cancelled = Utils.isCancelled(event);
        let forumLink = null;

        if (event.description) {
            const links = Utils.getLinks(event.description);
            const forumLinks = Utils.getForumLinks(event.description);
            forumLink = forumLinks ? forumLinks[0] : links ? links[0] : null
        }

        const start = moment(event.start.date || event.start.dateTime);
        const end = moment(event.end.date || event.end.dateTime);

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
            current: start < now && end > now,
            forumLink: forumLink
        }
    }
}

export default withStyles(styles)(App);
