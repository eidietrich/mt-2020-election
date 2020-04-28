const API_URLS = {
    geocode: 'https://gisservicemt.gov/arcgis/rest/services/MSL/AddressLocator/GeocodeServer/findAddressCandidates',
    house: 'https://services.arcgis.com/qnjIrwR8z5Izc0ij/arcgis/rest/services/Ql5J5/FeatureServer/0/query',
    senate: 'https://services.arcgis.com/qnjIrwR8z5Izc0ij/arcgis/rest/services/CChZA/FeatureServer/0/query',
}

export default class DistrictGeocoder {
    async districtsForAddress(address, callback, fallback){
        const res = await this.geocode(address)
        const location = this.pickAddress(res.candidates)
        if (location){
            const houseDistrict = await this.getDistrict(location.location, res.spatialReference, API_URLS.house)
            const senateDistrict = await this.getDistrict(location.location, res.spatialReference, API_URLS.senate)
            callback({
              'location': location,
              'house': houseDistrict,
              'senate': senateDistrict,
            })
        } else {
           fallback()
        }
        
    }

    async geocode(address){
        const payload = {
            SingleLine: address,
            f: 'json',
            outSR: `{"wkid"%3A102100}`,
        }
        const url = this.makeQuery(API_URLS.geocode, payload)
        const location = await fetch(url)
            .then(data => data.json())
            .catch(err => console.log(err))
        return location
    }

    async getDistrict(coords, crs, apiUrl) {
        const payload = {
            f: 'json',
            returnGeometry: 'false',
            spatialRel: 'esriSpatialRelIntersects',
            geometry: `{"x":${coords.x},"y":${coords.y},"spatialReference":${JSON.stringify(crs)}}`,
            geometryType: 'esriGeometryPoint',
            inSR: '102100',
            outFields: '*',
            outSR: '102100',
        }
        const url = this.makeQuery(apiUrl, payload)
        const data = await fetch(url)
            .then(data => data.json())
            .then(res => res.features[0].attributes)
            .catch(err => console.log(err))
        return data
    }

    makeQuery(url, params) {
        let string = url + '?'
        for (let key in params){
            string = string + `${key}=${params[key].replace(/\s/g, '%20').replace(/#/g, '%23')}&`
        }
        return string
    }

    pickAddress(candidates) {
      return candidates[0]
    }
  }