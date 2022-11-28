import React from 'react';
import './Gallery.css';

//show pictures, if there is an error display error, if there are no pics display no pics msg
function Gallery({ venuePics, error, activeMarker, isLoadingPic }: any) {
  return (
    <div className="photo-grid">
      {!error &&
        venuePics.map((venue: any) => (
          <div className="card" key={venue.id}>
            <img src={venue.url} alt="Nature" className="responsive" />
          </div>
        ))}
      {error && <div>Error in displaying venues images</div>}
      {venuePics.length === 0 && activeMarker != null && !isLoadingPic && (
        <div>No images found for this venue</div>
      )}
    </div>
  );
}

export default Gallery;
