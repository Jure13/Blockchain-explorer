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
