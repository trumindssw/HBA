String.prototype.toTitleCase = () => {
    return this.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};

String.prototype.toSentenceCase = () => {
    return this.toLowerCase().charAt(0).toUpperCase() + str.slice(1);
};