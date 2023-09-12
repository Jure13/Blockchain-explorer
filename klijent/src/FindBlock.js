import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import BlockDetails from "./BlockDetails";
import "./app.css";

const FindBlock = () => {
    const [blockTag, setBlockTag] = useState("");
    const [blockInfo, setBlockInfo] = useState(null);
    const [testInfo, setTestInfo] = useState(null);
    // const [transaction, setTransaction] = useState([]);
    const [errorMessageOne, setErrorMessageOne] = useState(null); 
    const [errorMessageTwo, setErrorMessageTwo] = useState(null);  
    const [address, setAddress] = useState("");
    const [errorMessageAddress, setErrorMessageAddress] = useState(null);   
    
    useEffect(() => {
        fetch("http://localhost:8332/start").then((response) => response.json())
            .then((result) => {
              console.log(result)
                setTestInfo(result)
            })
    }, [])

    const navigate = useNavigate();

    const handleSearch = (e, data) => {
        e.preventDefault();

        if(data.substring(0, 8) === "00000000") {
            fetch("http://localhost:8332/getBlock/" + data).then((response) => response.json())
            .then((result) => {
                // console.log(result)
                setBlockInfo(result)
                // setTransaction([])
            })

            return;
        }

        /*if(data.length <= 7) {
            fetch("http://localhost:8332/blockInfo/" + data).then((response) => response.json())
            .then((result) => {
                console.log(result)
                setBlockInfo(result)
                // setTransaction([])
            })

            return;
        }*/
        
        if (data.length <= 7) {
            fetch("http://localhost:8332/blockInfo/" + data).then((response) => {
                if (response.status === 400) {
                  return response.json().then((error) => {
                    setErrorMessageOne(error.error);
                    // setErrorMessageOne(`Krivi unos! ${data} se ne može unijeti!`);
                  });
                }
                return response.json();
              })
              .then((result) => {
                if (!errorMessageOne) {
                  setBlockInfo(result);
                }
              });        
            return;
        }

        /*if (data.length > 7) {
            fetch(`http://localhost:8332/getTransaction/${data}`).then((response) => { console.log('Response status:', response.status);
                if (response.status === 404) {
                  return response.json().then((error) => { console.log('Error message from server:', error);
                    setErrorMessageTwo(error.error);
                  });
                }
                return response.json();
              })
              .then((result) => {
                if (!errorMessageTwo) { console.log('Transaction data:', result);
                    navigate("/transaction/details/" + data);
                }
              })
              .catch((error) => {
                console.error('Client-side error:', error);
              });
            return;
        }*/

        if (data.length > 7) {
            fetch(`http://localhost:8332/getTransaction/${data}`).then((response) => {
                if (!response.ok) {
                  throw new Error("Transakcija ne postoji!");
                }
                return response.json();
              })
              .then((result) => {
                    navigate("/transaction/details/" + data);
              })
              .catch((error) => {
                console.error('Client-side error:', error);
                setErrorMessageTwo("Nema transakcije!");
              });
          }
    }

    const reloadPage = () => {
        window.location.href = "/";
    };

    const handleAddressSearch = (e) => {
      e.preventDefault();
      if (address.trim() === "") {
        setErrorMessageAddress("Unesi valjanu adresu:");
      } else {
        navigate(`/address/${address}`);
      }
    };     
    
    return(
        <div className="mainContainer">
            <h2>Bitcoin Explorer</h2>
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg" alt="Nemoguće dohvatiti sliku!" className="slika"></img>
            <br/>
            <form className="card" onSubmit={(e) => handleSearch(e, blockTag)}>
                <input className="trazilica"
                type="text" placeholder="Pretraži blokove i transakcije" onChange={e => setBlockTag(e.target.value) } />
                <br/>
                <button className="tipka" 
                type="submit" onClick={(e) => handleSearch(e, blockTag)}>
                    Pretraži
                </button>
            </form>
            
            {errorMessageOne && (
                <div className="greska">{errorMessageOne}
                <br/>
                <button className="tipka" onClick={reloadPage}>Početna</button>
                </div>
            )}

            {errorMessageTwo && (
                <div className="greska">{errorMessageTwo}
                <br/>
                <button className="tipka" onClick={reloadPage}>Početna</button>
                </div>
            )}

            <br/>
            <form className="card" onSubmit={(e) => handleAddressSearch(e, address)}>
              <input className="trazilica" type="text" placeholder="Pretraži adrese" onChange={(e) => setAddress(e.target.value)}/>
              <br />
              <button className="tipka" type="submit" onClick={(e) => handleAddressSearch(e, address)}>Pretraži</button>
            </form>
            
            <br/>
            {errorMessageAddress && (
                <div className="greska">{errorMessageAddress}</div>
            )}

            <br/>
            {blockInfo &&(
                <BlockDetails props={blockInfo} />
            )}

            
            {testInfo != null && blockInfo == null ? (
                <div className="server">
                    <h1>Podatci o serveru</h1>
                    <p>Naziv: {testInfo.chain}</p>
                    <p>Broj blokova: { testInfo.blocks }</p>
                    <p>Broj <i>headera</i>: { testInfo.headers }</p>
                    <p><i>Hash</i> najboljeg bloka: {testInfo.bestblockhash}
                    {/* <a href={"http://localhost:8332/getBlock/" + testInfo.bestblockhash} target="_blank" rel="noopener noreferrer">{testInfo.bestblockhash} </a> */}
                    </p>
                    <p>Veličina na disku: { testInfo.size_on_disk } B</p>
                </div>
            ): blockInfo != null ? (<></>) : <h4>Neuspješno spjanje na server! {console.log(testInfo)}</h4>    
            }

            <br/>
        </div>
    );
}

export default FindBlock;