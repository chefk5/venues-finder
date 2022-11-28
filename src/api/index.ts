import axios from 'axios';

//function to reuse axios get
const get = (url: string) => {
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        headers: {
          accept: 'application/json',
          Authorization: process.env.REACT_APP_FOURSQUARE_AUTHORIZATION_KEY,
        },
      })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        console.log(
          '🚀 ~ file: apis.ts ~ line 16 ~ returnnewPromise ~ err',
          err,
        );

        reject(err);
      });
  });
};

export { get };
