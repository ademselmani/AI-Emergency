import React, { useState, useEffect } from "react";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap 
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import polyline from "@mapbox/polyline";
import io from "socket.io-client";

const socket = io("http://localhost:3000");
const OSRM_URL = "https://router.project-osrm.org/route/v1/driving/";
const basePosition = [36.8321, 10.1465];

const styles = `
  .reception-container {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
    height: 100vh;
    padding: 20px;
    background-color: #f5f7fa;
  }
  
  .demandes-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .demandes-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .badge {
    background-color: #3a86ff;
    color: white;
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 14px;
    font-weight: bold;
  }
  
  .trip-info-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    display: flex;
    gap: 16px;
  }
  
  .info-box {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .icon-circle {
    background: #f0f4ff;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }
  
  .info-label {
    display: block;
    font-size: 12px;
    color: #6b7280;
  }
  
  .info-value {
    display: block;
    font-size: 16px;
    font-weight: bold;
    color: #111827;
  }
  
  .demandes-scroll-container {
    overflow-y: auto;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-right: 8px;
  }
  
  .demande-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .demande-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
  
  .demande-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .patient-id {
    font-weight: bold;
    color: #111827;
  }
  
  .status-badge {
    background-color: #fef3c7;
    color: #92400e;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
  }
  
  .demande-content {
    margin-bottom: 16px;
  }
  
  .location-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #4b5563;
    font-size: 14px;
  }
  
  .location-icon {
    font-size: 16px;
  }
  
  .accept-button {
    width: 100%;
    background-color: #ff3b3f;
    color: white;
    border: none;
    padding: 5px;
    border-radius: 8px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .accept-button:hover {
    background-color:rgb(211, 18, 34);
  }
  
  .button-icon {
    font-size: 18px;
  }
  
  .map-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .map-header {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .map-legend {
    display: flex;
    gap: 16px;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #4b5563;
  }
  
  .ambulance-legend-icon {
    width: 16px;
    height: 16px;
    background-color: #ff3b3f;
    border-radius: 50%;
  }
  
  .map-inner-container {
    flex-grow: 1;
    position: relative;
  }
`;

const RoutingMachine = ({ coordinates }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!coordinates.length) return;
    
    const routeLine = L.polyline(coordinates, {
      color: "#3b82f6",
      weight: 4,
      opacity: 0.7
    }).addTo(map);

    map.fitBounds(routeLine.getBounds());
    
    return () => {
      if(map && routeLine) map.removeLayer(routeLine);
    };
  }, [coordinates, map]);

  return null;
};

const AmbulanceReceptionniste = () => {
  const [demandes, setDemandes] = useState([]);
  const [ambulancePosition, setAmbulancePosition] = useState(basePosition);
  const [routeCoords, setRouteCoords] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [addresses, setAddresses] = useState({});

  
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.address) {
        // Construction d'une adresse plus détaillée
        const addressParts = [];
        if (data.address.building) addressParts.push(data.address.building);
        if (data.address.house_number) addressParts.push(data.address.house_number);
        if (data.address.road) addressParts.push(data.address.road);
        if (data.address.neighbourhood) addressParts.push(`(${data.address.neighbourhood})`);
        if (data.address.city) addressParts.push(data.address.city);
        
        // Si l'adresse est trop courte, ajouter plus de détails
        if (addressParts.length < 3 && data.display_name) {
          return data.display_name.split(',').slice(0, 4).join(', ');
        }
        
        return addressParts.join(', ');
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error("Erreur de géocodage inverse:", error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      await fetchDemandes();
      
      socket.on("nouvelleDemande", async (data) => {
        const address = await reverseGeocode(data.position.lat, data.position.lng);
        setAddresses(prev => ({ ...prev, [data._id]: address }));
        setDemandes(prev => [...prev.filter(d => d._id !== data._id), data]);
      });
  
      socket.on("demandeAcceptée", (id) => {
        setDemandes(prev => prev.filter(d => d._id !== id));
      });
    };
  
    fetchData();
  
    return () => {
      socket.off("nouvelleDemande");
      socket.off("demandeAcceptée");
    };
  }, []);

  const fetchDemandes = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/demandes");
      const data = await res.json();
      setDemandes(data);
      
      // Récupérer les adresses pour toutes les demandes
      const newAddresses = {};
      for (const demande of data) {
        const address = await reverseGeocode(demande.position.lat, demande.position.lng);
        newAddresses[demande._id] = address;
      }
      setAddresses(newAddresses);
    } catch (error) {
      console.error("Erreur de récupération des demandes:", error);
    }
  };

  const getRoute = async (start, end) => {
    try {
      const response = await fetch(
        `${OSRM_URL}${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=polyline`
      );
      const data = await response.json();
      
      if (data.code === "Ok" && data.routes[0]) {
        return {
          coordinates: polyline.decode(data.routes[0].geometry).map(([lat, lng]) => [lat, lng]),
          duration: data.routes[0].duration,
          distance: data.routes[0].distance
        };
      }
      return { coordinates: [], duration: 0, distance: 0 };
    } catch (error) {
      console.error("Erreur de calcul d'itinéraire:", error);
      return { coordinates: [], duration: 0, distance: 0 };
    }
  };

  const startTrip = async (destination) => {
    if (currentTrip) {
      clearInterval(currentTrip);
      setCurrentTrip(null);
    }

    const { coordinates: routeToPatient, duration, distance } = await getRoute(basePosition, destination);
    if (!routeToPatient.length) return;

    setCurrentDuration(Math.round(duration / 60));
    setCurrentDistance(Math.round(distance / 1000));
    setRouteCoords(routeToPatient);
    
    let step = 0;
    const totalSteps = routeToPatient.length;
    const stepDuration = (duration * 1000) / totalSteps;

    const interval = setInterval(() => {
      if (step >= totalSteps) {
        clearInterval(interval);
        setTimeout(() => returnToBase(destination), 5000);
        return;
      }
      
      const newPos = routeToPatient[step];
      setAmbulancePosition(newPos);
      socket.emit("ambulancePositionUpdate", { lat: newPos[0], lng: newPos[1] });
      step++;
    }, stepDuration);

    setCurrentTrip(interval);
  };

  const returnToBase = async (fromPosition) => {
    const { coordinates: routeToBase, duration, distance } = await getRoute(fromPosition, basePosition);
    if (!routeToBase.length) return;

    setCurrentDuration(Math.round(duration / 60));
    setCurrentDistance(Math.round(distance / 1000));
    setRouteCoords(routeToBase);
    
    let step = 0;
    const totalSteps = routeToBase.length;
    const stepDuration = (duration * 1000) / totalSteps;

    const interval = setInterval(() => {
      if (step >= totalSteps) {
        clearInterval(interval);
        setCurrentTrip(null);
        return;
      }
      
      const newPos = routeToBase[step];
      setAmbulancePosition(newPos);
      socket.emit("ambulancePositionUpdate", { lat: newPos[0], lng: newPos[1] });
      step++;
    }, stepDuration);

    setCurrentTrip(interval);
  };

  const accepterDemande = async (id, position) => {
    try {
      await fetch(`http://localhost:3000/api/demandes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      
      setDemandes(prev => prev.filter(d => d._id !== id));
      socket.emit("validerDemande", id);
      startTrip([position.lat, position.lng]);
    } catch (error) {
      console.error("Erreur d'acceptation de demande:", error);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="reception-container">
        <div className="demandes-list">
          <div className="demandes-header">
            <h2>Pending requests</h2>
           
          </div>
          
          <div className="trip-info-card">
            <div className="info-box">
              <div className="icon-circle">⏱</div>
              <div>
                <span className="info-label">Estimated duration</span>
                <span className="info-value">{currentDuration} min</span>
              </div>
            </div>
            <div className="info-box">
              <div className="icon-circle">📏</div>
              <div>
                <span className="info-label">Total distance</span>
                <span className="info-value">{currentDistance} km</span>
              </div>
            </div>
          </div>
  
          <div className="demandes-scroll-container">
            {demandes
              .filter(demande => !demande.status || demande.status === 'En attente')
              .map((demande) => (
                <div key={demande._id} className="demande-card">
                  <div className="demande-header">
                    <span className="patient-id">{demande.name}{demande.patientId?.slice(-4)}</span>
                    <span className="status-badge">Pending</span>
                  </div>
                  <div className="demande-content">
                    <div className="location-info">
                      <span className="location-icon">📍</span>
                      <span>
                        {addresses[demande._id] || "Chargement de l'adresse..."}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="accept-button"
                    onClick={() => accepterDemande(demande._id, demande.position)}
                  >
                    <span>Send the ambulance</span>
                    <span className="button-icon">🚑</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
  
        <div className="map-card">
          <div className="map-header">
            <h2>Real-time location</h2>
            <div className="map-legend">
              <div className="legend-item">
                <div className="ambulance-legend-icon"></div>
                <span>Ambulance</span>
              </div>
            </div>
          </div>
          <div className="map-inner-container">
            <MapContainer 
              center={basePosition} 
              zoom={13} 
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%", borderRadius: "0 0 12px 12px" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              
              <Marker 
                position={ambulancePosition} 
                icon={L.icon({
                  iconUrl: 'https://cdn-icons-png.flaticon.com/128/12349/12349613.png',
                  iconSize: [40, 40],
                })}
              >
                <Popup>
                  Ambulance en mission
                </Popup>
              </Marker>
              
              <RoutingMachine coordinates={routeCoords} />
            </MapContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default AmbulanceReceptionniste;