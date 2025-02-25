import React, { useState } from 'react';
import axios from 'axios';

const Passwordforget= () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/auth/forget-password", { email });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Erreur lors de l'envoi de l'e-mail");
    }
  };

  return (
    <div>
      <h2>Mot de passe oublié</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button type="submit">Envoyer un e-mail de réinitialisation</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Passwordforget;
