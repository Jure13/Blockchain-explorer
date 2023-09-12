import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import './index.css';
import { Link } from "react-router-dom";


const TransactionDetails = () => {
    const params = useParams()
    const [transaction, setTransaction] = useState([]);
    const [fee, setFee] = useState([])

    useEffect(() => {
        Promise.all([
            fetch("http://localhost:8332/getTransaction/" + params.txId),
            fetch("http://localhost:8332/getFee/" + params.txId),
        ])
        .then(([reTransaction, reFee]) => Promise.all([reTransaction.json(), reFee.json()])
        )
        .then(([dataTransaction, dataFee]) => {
            setTransaction(dataTransaction);
            setFee(dataFee)
        });
    }, [params])

/*
const TransactionDetails = () => {
    const params = useParams()
    const [transaction, setTransaction] = useState([]);
    const [fee, setFee] = useState([]);
    const [sendingAddresses, setSendingAddresses] = useState([]); // New state for sending addresses
    const [receivingAddresses, setReceivingAddresses] = useState([]); // New state for receiving addresses

    const TransactionDetails = () => {
        const params = useParams()
        const [transaction, setTransaction] = useState([]);
        const [fee, setFee] = useState([]);
        const [sendingAddresses, setSendingAddresses] = useState([]);
        const [receivingAddresses, setReceivingAddresses] = useState([]);
    
        useEffect(() => {
            Promise.all([
                fetch("http://localhost:8332/getTransaction/" + params.txId),
                fetch("http://localhost:8332/getFee/" + params.txId),
            ])
            .then(([reTransaction, reFee]) => Promise.all([reTransaction.json(), reFee.json()]))
            .then(([dataTransaction, dataFee]) => {
                setTransaction(dataTransaction);
                setFee(dataFee);
                setSendingAddresses(dataTransaction.sendingAddresses); // Assuming the backend now includes this information
                setReceivingAddresses(dataTransaction.receivingAddresses); // Assuming the backend now includes this information
            });
        }, [params])
        /*
        return (transaction && transaction.vin && transaction && fee && sendingAddresses && receivingAddresses) && (
            <div className="tx">
                <h2>Transakcija: {transaction.txid}</h2>
                <table className="table">
                    <tbody>
                        <tr>
                            <th scope="row">Sending Addresses:</th>
                            <td>
                                {sendingAddresses.map((address, index) => (
                                    <p key={index}>{address}</p>
                                ))}
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Receiving Addresses:</th>
                            <td>
                                {receivingAddresses.map((address, index) => (
                                    <p key={index}>{address}</p>
                                ))}
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Naknada:</th>
                            <td>{fee} satoshija</td>
                        </tr>
                    </tbody>
                </table>
    
                <br/>
                <button className="tipka" type="submit" >
                    <Link to="/">Početna</Link>
               </button>
            </div>
        )
    }*/

    
    return (transaction && transaction.vin && transaction ) && (
        <div className="tx">
            <h2>Transakcija: {transaction.txid} {}</h2>
            <table className="table">
                <tbody>
                    <tr>
                        <th scope="row">Naknada:</th>
                        <td>{fee} satoshija</td>
                    </tr>
                    <tr>
                        <th scope="row">Hash:</th>
                        <td>{transaction.hash}</td>
                    </tr>
                    <tr>
                        <th scope="row">Veličina:</th>
                        <td>{transaction.size} bajtova</td>
                    </tr>
                    <tr>
                        <th scope="row">Težina:</th>
                        <td>{transaction.weight}</td>
                    </tr>
                    <tr>
                        <th scope="row">Vrijeme zaključavanja:</th>
                        <td>{transaction.locktime}</td>
                    </tr>
                    <tr>
                        <th scope="row">Broj ulaza:</th>
                        <td>{transaction.vin.length}</td>
                    </tr>
                    <tr>
                        <th scope="row">Broj izlaza:</th>
                        <td>{transaction.vout.length}</td>
                    </tr>
                    <tr>
                        <th scope="row">Ulazne transakcije:</th>
                        <td>{transaction.vin.map((tx, index) => (<Link key={index} to={"/transaction/details/" + tx.txid}><p>{tx.txid}</p></Link>))}</td>
                    </tr>
                </tbody>
            </table>

            <br/>
            <button className="tipka" type="submit" >
                <Link to="/">Početna</Link>
           </button>
        </div>
    )
    /*
    return (transaction && transaction.vin && transaction && fee && sendingAddresses && receivingAddresses) && (
        <div className="tx">
            <h2>Transakcija: {transaction.txid}</h2>
            <table className="table">
                <tbody>
                    <tr>
                        <th scope="row">Sending Addresses:</th>
                        <td>
                            {sendingAddresses.map((address, index) => (
                                <p key={index}>{address}</p>
                            ))}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Receiving Addresses:</th>
                        <td>
                            {receivingAddresses.map((address, index) => (
                                <p key={index}>{address}</p>
                            ))}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Naknada:</th>
                        <td>{fee} satoshija</td>
                    </tr>
                    <tr>
                        <th scope="row">Hash:</th>
                        <td>{transaction.hash}</td>
                    </tr>
                    <tr>
                        <th scope="row">Veličina:</th>
                        <td>{transaction.size} bajtova</td>
                    </tr>
                    <tr>
                        <th scope="row">Težina:</th>
                        <td>{transaction.weight}</td>
                    </tr>
                    <tr>
                        <th scope="row">Vrijeme zaključavanja:</th>
                        <td>{transaction.locktime}</td>
                    </tr>
                    <tr>
                        <th scope="row">Broj ulaza:</th>
                        <td>{transaction.vin.length}</td>
                    </tr>
                    <tr>
                        <th scope="row">Broj izlaza:</th>
                        <td>{transaction.vout.length}</td>
                    </tr>
                    <tr>
                        <th scope="row">Ulazne transakcije:</th>
                        <td>{transaction.vin.map((tx, index) => (<Link key={index} to={"/transaction/details/" + tx.txid}><p>{tx.txid}</p></Link>))}</td>
                    </tr>
                </tbody>
            </table>

            <br/>
            <button className="tipka" type="submit" >
                <Link to="/">Početna</Link>
           </button>
        </div>
    )*/
}

export default TransactionDetails;