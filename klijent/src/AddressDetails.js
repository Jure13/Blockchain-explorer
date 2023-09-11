import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import './index.css';

const AddressDetails = () => {
  const { address } = useParams();
  const [addressDetails, setAddressDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null); 

  /*useEffect(() => {
    fetch(`http://localhost:8332/getAddress/${address}`).then((response) => response.json()).then((result) => {
        setAddressDetails(result);
      }).catch((error) => {
        console.error('Greška prilikom dohvata adrese:', error);
      });
  }, [address]);*/

  useEffect(() => {
    fetch(`http://localhost:8332/getAddress/${address}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Addrese nema');
        }
        return response.json();
      })
      .then((result) => {
        setAddressDetails(result);
      })
      .catch((error) => {
        console.error('Greška s adresom:', error);
        setErrorMessage('Adresa ne valja!');
      });
  }, [address]);

  const reloadPage = () => {
    window.location.href = "/";
};

  return (
    <div>
        <h2>O adresi</h2>
        {addressDetails ? (
        <div>
            <p>Adresa: {addressDetails.address}</p>
            <p>Stanje: {addressDetails.balance}</p>
            <p>Transakcije: {addressDetails.transactions}</p>
        </div>
        ) : (
            <p>{errorMessage || 'Učitavanje...'}</p>
        )}
        <br/>
        <br/>
        {errorMessage && (
                <div className="greska">{errorMessage}</div>
        )}
        <br/>
        <button className="tipka" onClick={reloadPage}>Početna</button>
    </div>
  );
};

export default AddressDetails;
