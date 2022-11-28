import React, { useMemo, useState, useEffect } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Circle,
  InfoWindowF,
} from '@react-google-maps/api';
import './Map.css';
import { Gallery } from '../gallery';
import { get } from '../../api';
import { fetchVenuesPicsURL, fetchVenuesURL } from '../../api/urls';

//styles for cicle on the map
const circleOptions = {
  strokeColor: '#FF0000',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#FF0000',
};

//type for venues geocode
type VenueGeocodeType = {
  geocodes: { main: { latitude: number; longitude: number } };
};

//type for venues pics
type ResponsePicsType = {
  id: string;
  url: string;
};

//types for both map and marker
type MapType = google.maps.Map;
type MarkerType = google.maps.Marker;

function Map() {
  const [venues, setVenues] = useState([]);
  const [activeMarker, setActiveMarker] = useState<MarkerType | null>(null);
  const [pics, setPics] = useState<ResponsePicsType[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [errorPic, setErrorPic] = useState<boolean>(false);
  const [isLoadingPic, setIsLoadingPic] = useState<boolean>(false);
  //inside usememo so it is not recalculted in every re-render
  const center = useMemo<google.maps.LatLngLiteral>(
    () => ({ lat: 58.378127, lng: 26.732052 }),
    [],
  );
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
  });

  //fetch venues when app loads
  useEffect(() => {
    fetchVenues();
  }, []);

  //fit bounds to show all markers in the map (not 100% sure if this is the correct way to do it)
  const onLoad = React.useCallback(
    function callback(map: MapType) {
      const bounds = new window.google.maps.LatLngBounds();
      venues.forEach((venue: VenueGeocodeType) =>
        bounds.extend({
          lat: venue.geocodes.main.latitude,
          lng: venue.geocodes.main.longitude,
        }),
      );
      map.fitBounds(bounds);
    },
    [venues],
  );

  //distance is 1100m becuase one restuarant is inside the circle even with distance more than 1000m
  //I did not type check the api response
  const fetchVenues = () => {
    get(fetchVenuesURL)
      .then((response: any) => {
        const venues = response.data.results;
        const filteredVenues = venues.filter(
          (venue: { distance: number }) => venue.distance > 1100,
        );
        setVenues(filteredVenues);
        setError(false);
      })
      .catch((err) => {
        console.error('error occured: ', err.message);
        setError(true);
      });
  };

  //I did not type check the api response
  //get venues pictures and push them into an array.
  const showVenuePics = async (id: string) => {
    await setIsLoadingPic(true);
    const responsePics: ResponsePicsType[] = [];
    get(fetchVenuesPicsURL(id))
      .then(async (response: any) => {
        response.data.forEach((response: any) => {
          responsePics.push({
            id: response.id,
            url: `${response.prefix}250x205${response.suffix}`,
          });
        });
        setErrorPic(false);
        setPics(responsePics);
        await setIsLoadingPic(false);
      })
      .catch(() => {
        setErrorPic(false);
        setIsLoadingPic(false);
      });
  };

  //used when clicking on a marker
  const handleActiveMarker = (marker: MarkerType) => {
    if (marker === activeMarker) {
      return;
    }
    setActiveMarker(marker);
  };

  //used when closing the info in an openened nmarker
  const handleCloseActiveMarker = () => {
    setPics([]);
    setActiveMarker(null);
  };

  //if map is loaded and there are venues available and no error
  return isLoaded && venues.length > 0 && !error ? (
    <div className="mapContainer">
      <GoogleMap onLoad={onLoad} mapContainerClassName="map" zoom={14.1}>
        <Circle center={center} radius={500} options={circleOptions} />
        {venues.map((ven: any) => (
          <Marker
            key={ven.fsq_id}
            onClick={() => {
              showVenuePics(ven.fsq_id);
              handleActiveMarker(ven.fsq_id);
            }}
            position={{
              lat: ven.geocodes.main.latitude,
              lng: ven.geocodes.main.longitude,
            }}
          >
            {activeMarker === ven.fsq_id ? (
              <InfoWindowF onCloseClick={handleCloseActiveMarker}>
                <div>{ven.name}</div>
              </InfoWindowF>
            ) : null}
          </Marker>
        ))}
      </GoogleMap>
      <Gallery
        venuePics={pics}
        error={errorPic}
        activeMarker={activeMarker}
        isLoadingPic={isLoadingPic}
      />
    </div>
  ) : (
    //if loading show a msg and if there is an error show another msg
    <div className="mapContainer">{error ? 'error' : 'Loading...'}</div>
  );
}

export default React.memo(Map);
