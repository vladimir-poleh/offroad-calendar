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
        marginTop: '64px'
    }
});

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            events: [],
            years: [],
            year: ''
        };
    }

    componentDidMount() {
        this.loadData();
    }

    render() {
        const { classes } = this.props;

        const content = this.state.events && this.state.events.length
            ? <Calendar events={this.state.events} year={this.state.year} />
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
                                <MenuItem value="" disabled>Год</MenuItem>
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
        this.setState({ [event.target.name]: event.target.value });
    }

    loadData() {
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}`;
        const http = new XMLHttpRequest();
        http.open('GET', url);
        http.addEventListener('load', () => {
            const response = JSON.parse(http.response);

            if (response.items) {
                const now = moment();
                const events = response.items
                    .filter(i => i.kind === 'calendar#event')
                    .map(i => {
                        const cancelled = !!i.summary.match(/^\s*отмена!/i);
                        const forumLinks = i.description.match(/http:\/\/4x4forum\.by\/\S+?\.html/);
                        const start = moment(i.start.date);
                        const end = moment(i.end.date);
                        return {
                            etag: i.etag,
                            calendarLink: i.htmlLink,
                            summary: i.summary,
                            description: i.description,
                            location: i.location,
                            start: start,
                            end: end,
                            cancelled: cancelled,
                            started: start < now,
                            forumLink: forumLinks ? forumLinks[0] : null
                        }
                    });

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
}

export default withStyles(styles)(App);
