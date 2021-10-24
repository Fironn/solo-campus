import './map.css'
import { MapContainer, Marker, Popup, TileLayer, useMapEvents, useMapEvent } from 'react-leaflet';
import { useState, useEffect } from 'react'


const AddMarkerToClick = (state: any) => {
    const map = useMapEvents({
        click(e) {
            const newMarker = e.latlng
            state.onClick(newMarker)
        },
        locationfound: (location) => {
            console.log('location found:', location)
        },
    })

    return (
        <>
            <Marker position={state.marker}>
            </Marker>
        </>
    )
}
const Map = (state: any) => {
    const init = { lat: "37.523423", lng: "139.938035" }
    return (<>
        <MapContainer center={state.marker ? state.marker : init} zoom={15} id="map">
            <TileLayer
                attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {state.onClick ?
                <AddMarkerToClick marker={state.marker ? state.marker : init} onClick={state.onClick} />
                :
                <Marker position={state.marker}>
                </Marker>
            }
        </MapContainer>
    </>)
}

export default Map;
