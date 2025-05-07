import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFilter, FiSearch, FiEdit2, FiEye, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const ListePatientTriage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/patients');
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        if (data.success) {
          setPatients(data.data);
        } else {
          setError('An error occurred while retrieving patients');
        }
      } catch (err) {
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
  };

  const handleEditPatient = (id) => {
    navigate(`/UpdatePatientTriage/${id}`);
  };

  const closeDetails = () => {
    setSelectedPatient(null);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Critical': return { backgroundColor: '#fee2e2', color: '#b91c1c' };
      case 'Stable': return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'Triage': return { backgroundColor: '#fef9c3', color: '#854d0e' };
      case 'Recovered': return { backgroundColor: '#dbeafe', color: '#1e40af' };
      default: return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'Critical': return { backgroundColor: '#ef4444' };
      case 'Stable': return { backgroundColor: '#22c55e' };
      case 'Triage': return { backgroundColor: '#eab308' };
      case 'Recovered': return { backgroundColor: '#3b82f6' };
      default: return { backgroundColor: '#6b7280' };
    }
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const month = today.getMonth();
    if (month < birthDateObj.getMonth() || (month === birthDateObj.getMonth() && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  let filteredPatients = patients
    .filter(patient => patient.status === 'Triage')
    .filter(patient =>
      (patient.firstName && typeof patient.firstName === 'string' && patient.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.lastName && typeof patient.lastName === 'string' && patient.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.emergencyReason && typeof patient.emergencyReason === 'string' && patient.emergencyReason.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.arrivalMode && typeof patient.arrivalMode === 'string' && patient.arrivalMode.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  if (sortOption === 'recent') {
    filteredPatients.sort((a, b) => new Date(b.birthDate) - new Date(a.birthDate));
  } else if (sortOption === 'oldest') {
    filteredPatients.sort((a, b) => new Date(a.birthDate) - new Date(b.birthDate));
  } else if (sortOption === 'name-asc') {
    filteredPatients.sort((a, b) => a.lastName.localeCompare(b.lastName));
  } else if (sortOption === 'name-desc') {
    filteredPatients.sort((a, b) => b.lastName.localeCompare(a.lastName));
  }

  if (loading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.2rem',
      color: '#4b5563'
    }}>
      Loading...
    </div>
  );

  if (error) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.2rem',
      color: '#dc2626'
    }}>
      {error}
    </div>
  );

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: '2rem'
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '1.5rem'
        }}>Patient List</h1>

        {/* Search and Filter Bar */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <div style={{
            position: 'relative',
            flex: '1',
            minWidth: '300px'
          }}>
            <FiSearch style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Search by name, arrival mode, or emergency reason..."
              style={{
                width: '100%',
                padding: '0.5rem 2.5rem',
                borderRadius: '0.375rem',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Button */}
          <div style={{ position: 'relative' }}>
            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#ff3b3f',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'white'
              }}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FiFilter />
              Filter
              {isFilterOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            {/* Dropdown Filter Menu */}
            {isFilterOpen && (
              <ul style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                zIndex: '10',
                minWidth: '160px',
                marginTop: '0.5rem',
                padding: '0.5rem 0',
                listStyle: 'none'
              }}>
                <li 
                  style={{
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#374151',
                    ':hover': {
                      backgroundColor: '#f3f4f6'
                    }
                  }}
                  onClick={() => { setSortOption('recent'); setIsFilterOpen(false); }}
                >
                  Most recent
                </li>
                <li 
                  style={{
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#374151',
                    ':hover': {
                      backgroundColor: '#f3f4f6'
                    }
                  }}
                  onClick={() => { setSortOption('oldest'); setIsFilterOpen(false); }}
                >
                  Oldest
                </li>
                <li 
                  style={{
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#374151',
                    ':hover': {
                      backgroundColor: '#f3f4f6'
                    }
                  }}
                  onClick={() => { setSortOption('name-asc'); setIsFilterOpen(false); }}
                >
                  Name (A-Z)
                </li>
                <li 
                  style={{
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#374151',
                    ':hover': {
                      backgroundColor: '#f3f4f6'
                    }
                  }}
                  onClick={() => { setSortOption('name-desc'); setIsFilterOpen(false); }}
                >
                  Name (Z-A)
                </li>
              </ul>
            )}
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '0.875rem'
          }}>
            No patients found.
          </div>
        ) : (
          <div style={{
            overflowX: 'auto',
            borderRadius: '0.375rem',
            border: '1px solid #e5e7eb'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem'
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#f9fafb',
                  textAlign: 'left',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem'
                }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '500' }}>Last Name</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '500' }}>First Name</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '500' }}>Birth Date</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '500' }}>Arrival Mode</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '500' }}>Emergency Reason</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '500' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '500' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr 
                    key={patient._id}
                    style={{
                      borderTop: '1px solid #e5e7eb',
                      ':hover': {
                        backgroundColor: '#f9fafb'
                      }
                    }}
                  >
                    <td style={{ padding: '1rem', color: '#111827' }}>{patient.lastName}</td>
                    <td style={{ padding: '1rem', color: '#111827' }}>{patient.firstName}</td>
                    <td style={{ padding: '1rem', color: '#111827' }}>
                      {new Date(patient.birthDate).toLocaleDateString()} ({calculateAge(patient.birthDate)} years)
                    </td>
                    <td style={{ padding: '1rem', color: '#111827' }}>{patient.arrivalMode}</td>
                    <td style={{ padding: '1rem', color: '#111827' }}>{patient.emergencyReason}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          ...getStatusDot(patient.status)
                        }}></span>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          ...getStatusClass(patient.status)
                        }}>
                          {patient.status}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem'
                      }}>
                        <button 
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.375rem 0.75rem',
                            backgroundColor: '#FFB3B3',
                            color: '#db447e',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                          }}
                          onClick={() => handleViewDetails(patient)}
                        >
                          <FiEye size={14} />
                          Details
                        </button>
                        <button 
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.375rem 0.75rem',
                            backgroundColor: '#C5F2F1',
                            color: '#74d0d4',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                          }}
                          onClick={() => handleEditPatient(patient._id)}
                        >
                          <FiEdit2 size={14} />
                          Triage
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedPatient && (
          <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '50'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.5rem',
              position: 'relative'
            }}>
              <button 
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
                onClick={closeDetails}
              >
                <FiX size={20} />
              </button>
              
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '1rem'
              }}>Patient Details</h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Last Name</p>
                  <p style={{ color: '#111827', fontWeight: '500' }}>{selectedPatient.lastName}</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>First Name</p>
                  <p style={{ color: '#111827', fontWeight: '500' }}>{selectedPatient.firstName}</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Age</p>
                  <p style={{ color: '#111827', fontWeight: '500' }}>{calculateAge(selectedPatient.birthDate)} years</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Arrival Mode</p>
                  <p style={{ color: '#111827', fontWeight: '500' }}>{selectedPatient.arrivalMode}</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Emergency Reason</p>
                  <p style={{ color: '#111827', fontWeight: '500' }}>{selectedPatient.emergencyReason}</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Status</p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      ...getStatusDot(selectedPatient.status)
                    }}></span>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      ...getStatusClass(selectedPatient.status)
                    }}>
                      {selectedPatient.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Triage Level</p>
                  <p style={{ color: '#111827', fontWeight: '500' }}>{selectedPatient.triageLevel || 'Not assigned'}</p>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.75rem'
                }}>Medical Information</h3>
                <div style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.375rem',
                  padding: '1rem'
                }}>
                  {selectedPatient.medicalHistory ? (
                    <p style={{ color: '#111827' }}>{selectedPatient.medicalHistory}</p>
                  ) : (
                    <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No medical history provided</p>
                  )}
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem'
              }}>
                <button 
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'blue',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={closeDetails}
                >
                  Close
                </button>
                <button 
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ff3b3f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => handleEditPatient(selectedPatient._id)}
                >
                  Edit Triage
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListePatientTriage;