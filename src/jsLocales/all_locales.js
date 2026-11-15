(function (factory) {
var elo = factory(window);
if (typeof exports === 'object') {
exports = elo;
}
}(function (win) {
var elo = (win ? win.elo : false) || elo || {};
elo.locale = elo.locale || {};
elo.locale.localeMap = elo.locale.localeMap || {};
elo.locale.localeMap["de"] = elo.locale.localeMap["de"] || {};
elo.locale.localeMap["de"]["CECM.UPLOAD_DAY_2.TITLE"] = "Upload Day 2";
if (elo.data && elo.data.server && elo.data.server.language) {
elo.locale.language = elo.data.server.language;
elo.locale.store = elo.locale.localeMap[elo.locale.language];
}
return elo;
}));