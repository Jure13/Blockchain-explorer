const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express();
const port = 8332;
const bitcoincore = require('bitcoin-core');

app.use(cors())
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

 
const client = new bitcoincore({ 
  host: 'blockchain.oss.unist.hr', 
  username: 'student', 
  password: 'IhIskjGukNz9bRpWJL0FBNXmlSBd1pS5AtJdG1zfavLaICBuP4VDPEPMu67ql7U3', 
  port: 8332 
});


// Početna
app.get("/start", async (req, res) => {
  client.getBlockchainInfo().then((err, response) => {
    if(err) {
      res.send(err)
    }
    else {
      return res.json(response)
    }
  })
})

// Hash bloka
app.get('/getBlock/:blockHash', async(req, res) => {
    client.getBlock(req.params.blockHash).then((err, response) => {
      if(err) {
        res.send(err)
      }
      else {
        return res.json(response);
      }
    })
})

// Veličina bloka
/*
app.get('/blockInfo/:size', async(req, res) => {
  client.getBlockHash(parseInt(req.params.size)).then((response) => {
    client.getBlock(response).then((err, block) => {
        if(err) {
          res.send(err)
        }
        else {
          return res.json(block);
        }
    })
  });
})
*/

app.get('/blockInfo/:size', async(req, res) => {
  const size = req.params.size;
  
  if (!isValidSize(size)) {
    // return res.status(400).json({ error: "Krivi unos!" });
    return res.status(400).json({ error: `Krivi unos! ${size} se ne može unijeti!` });
  }

  client.getBlockHash(parseInt(size)).then((response) => {
    client.getBlock(response).then((err, block) => {
      if (err) {
        res.send(err);
      } else {
        return res.json(block);
      }
    });
  });
});

// Provjera unosa
function isValidSize(input) {
  if (typeof input !== 'string') {
    return false;
  }

  if (!/^\d+$/.test(input)) {
    return false;
  }

  if (input.length > 7) {
    return false;
  }

  return true;
}

// ID transakcije
/*app.get('/getTransaction/:txId', async(req, res) => {
  client.getRawTransaction(req.params.txId).then((transaction) => {
    client.decodeRawTransaction(transaction).then((err, decoded) => {
      if(err) {
        res.send(err)
      } else {
        return res.json(decoded)
      }
    })
  })
})*/


app.get('/getTransaction/:txId', async (req, res) => {
  const txId = req.params.txId;

  try {
    const transactionExists = await checkTx(txId);

    if (transactionExists) {
      const tx = await client.getRawTransaction(txId);
      const decTx = await client.decodeRawTransaction(tx);
      res.json(decTx);
    } else {
      res.status(404).json({ error: 'Transakcija ne postoji!' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/*
app.get('/getTransaction/:txId', async (req, res) => {
  const txId = req.params.txId;

  try {
    const transactionExists = await checkTx(txId);

    if (transactionExists) {
      const tx = await client.getRawTransaction(txId);
      const decTx = await client.decodeRawTransaction(tx);

      // Extract sending and receiving addresses
      const sendingAddresses = [];
      const receivingAddresses = [];

      for (const input of decTx.vin) {
        if (input.coinbase !== undefined) {
          // Coinbase transaction (mining reward)
          sendingAddresses.push('Coinbase'); // You can customize this message
        } else {
          // Regular transaction input
          const inputTx = await client.getRawTransaction(input.txid);
          const inputDecTx = await client.decodeRawTransaction(inputTx);
          sendingAddresses.push(inputDecTx.vout[input.vout].scriptPubKey.addresses[0]);
        }
      }

      for (const output of decTx.vout) {
        receivingAddresses.push(output.scriptPubKey.addresses[0]);
      }

      const addressDetails = {
        txid: decTx.txid,
        sendingAddresses,
        receivingAddresses,
        // Include other transaction details as needed
        hash: decTx.hash,
        size: decTx.size,
        weight: decTx.weight,
        locktime: decTx.locktime,
        vin: decTx.vin,
        vout: decTx.vout,
      };

      res.json(addressDetails);
    } else {
      res.status(404).json({ error: 'Transakcija ne postoji!' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});*/


// Provjera transakcije
async function checkTx(txId) {
  try {
    const tx = await client.getRawTransaction(txId);
    if (tx) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

// Računanje naknade
async function getFee(txId) {
  try {
    var rawTx = await client.getRawTransaction(txId);
    var decodedRawTx = await client.decodeRawTransaction(rawTx)
    var vinVouts = [];

    for (let i = 0; i < decodedRawTx.vin.length; i++){
      if(decodedRawTx.vin[i].coinbase != null) 
        continue
      vinVouts.push(decodedRawTx.vin[i].vout);
    }

    var vouts = 0;
    if(decodedRawTx.vin.length <= 0) {
      var tempTx = await client.getRawTransaction(decodedRawTx.vin[0].txid)
      var tempDecoded = await client.decodeRawTransaction(tempTx)

      for (let i = 0; i < vinVouts.length; i++)
        vouts += tempDecoded.vout[vinVouts[i]].value;      
    }
  
    var voutOne = 0;
    for (let i = 0; i < decodedRawTx.vout.length; i++)
      voutOne += decodedRawTx.vout[i].value;

    if(vouts === 0) 
      return voutOne    
    else 
      return (vouts - voutOne);
  }
  catch (error) {
      throw error;
  }
}

// Naknada
app.get('/getFee/:txId', async (req, res) =>{
  try {
    const fee = await getFee(req.params.txId);

    return res.json(fee)
  }
  catch(err) {
    res.send(err)
  }
})

// Adresa
app.get('/getAddress/:address', async (req, res) => {
  const address = req.params.address;

  try {
    const addressDetails = await fetchAddressDetails(address);

    res.json(addressDetails);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Dohvati adresu
async function fetchAddressDetails(address) {
  const addressDetails = await client.getAddressInfo(address);
  
  const formattedDetails = {
    address: address,
    balance: addressDetails.balance,
    transactions: addressDetails.transactions,
  };

  return formattedDetails;
}

app.listen(port, () => {
  console.log("Running on port " + port);
});

/*
async function getFee(txId) {
  try {
    const rawTx = await client.getRawTransaction(txId);
    const decodedRawTx = await client.decodeRawTransaction(rawTx);
    const vinVouts = [];

    // Calculate the total value of referenced outputs from previous transactions
    for (const vin of decodedRawTx.vin) {
      if (vin.coinbase === null) {
        const tempTx = await client.getRawTransaction(vin.txid);
        const tempDecoded = await client.decodeRawTransaction(tempTx);

        for (const voutIndex of vin.vout) {
          vinVouts.push(tempDecoded.vout[voutIndex].value);
        }
      }
    }

    // Calculate the total value of the transaction's outputs
    const voutOne = decodedRawTx.vout.reduce((total, output) => total + output.value, 0);

    // Calculate the fee as the difference between total inputs and total outputs
    const fee = vinVouts.reduce((total, value) => total + value, 0) - voutOne;

    return fee < 0 ? 0 : fee; // Ensure the fee is non-negative
  } catch (error) {
    throw error;
  }
}
*/