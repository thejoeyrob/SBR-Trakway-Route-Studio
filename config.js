/* Optional browser-safe deployment settings. Never place private or server keys here.
   Restrict public keys to your deployed website origin in the provider dashboard.
   Users can enter their own keys in Settings; keys are never included in projects. */
window.TRAKWAY_CONFIG = {
  mapboxPublicToken: '',
  what3wordsKey: '',
  defaultCenter: [52.587, -2.128],
  defaultZoom: 17,
  geocodingUrl: 'https://api.mapbox.com/search/geocode/v6/forward'
};
