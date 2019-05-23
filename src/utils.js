export default class Utils {
    static isCancelled = (event) => event.summary ? !!event.summary.match(/^\s*отмена!/i) : false;

    static getLinks = (data) => data ? data.match(/https?:\/\/[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/) : null;

    static getForumLinks = (data) => data ? data.match(/https?:\/\/4x4forum\.by\/\S+?\.html/) : null;

    static getMapLink = (location) => {
        if (!location) {
            return null;
        }

        const links = this.getLinks(location);

        if (links) {
            return links[0];
        }

        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    }
}