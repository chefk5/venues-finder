export const fetchVenuesURL =
  'https://api.foursquare.com/v3/places/search?query=hamburger&ll=58.37%2C26.7321&sort=DISTANCE&limit=50';

//or can be inside a utils file
export const fetchVenuesPicsURL = (id: string) => {
  return `https://api.foursquare.com/v3/places/${id}/photos`;
};
