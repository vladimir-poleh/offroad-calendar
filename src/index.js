import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import 'moment/locale/ru';
import './index.css';

const CALENDAR_ID = 'dda9q2ui2pt8qerj9dk6t5npbo@group.calendar.google.com';
const API_KEY = 'AIzaSyBjEOL_oeuRA5x2RB52NjvtHoucvjOEa3g';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            events: [],
        };
    }

    componentDidMount() {
        this.loadData();
    }

    render() {
        if (this.state.events && this.state.events.length) {
            return (
                <Calendar events={this.state.events} />
            );
        } else {
            return <div>Нет данных</div>
        }
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

                this.setState({ events: events });
            }
        });
        http.send();
    }
}

class Calendar extends Component {
    render() {
        const calendarEvents = this.props.events.map((event) => <CalendarEvent key={event.etag} event={event} />);
        return (
            <table className='calendar-table'>
                <thead>
                    <tr>
                        <th>Дата проведения</th>
                        <th>Мероприятие</th>
                        <th>Место проведения</th>
                        <th>Календарь</th>
                    </tr>
                </thead>
                <tbody>
                    {calendarEvents}
                </tbody>
            </table>
        );
    }
}

class CalendarEvent extends Component {
    render() {
        const event = this.props.event;
        const classNames = [];
        if (event.cancelled) {
            classNames.push('cancelled');
        }
        if (event.started) {
            classNames.push('started');
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
            <tr className={classNames.join(' ')}>
                <td>{startDate}</td>
                <td>{summary}</td>
                <td>{location}</td>
                <td><NewTabLink href={event.calendarLink} title='Открыть' /></td>
            </tr>
        );
    }
}

class NewTabLink extends Component {
    render() {
        return (
            <a href={this.props.href} target='_blank' rel='noopener noreferrer'>{this.props.title}</a>
        );
    }
}

moment.locale('ru');
ReactDOM.render(<App />, document.getElementById('root'));
