const socket = require('zmq');
const Web3 = require('web3');
const check = require('./Check');

class WormHoleEosAccount {
    initEthereumProvider(provider){
        const web3 = new Web3();
        web3.setProvider(provider);
        this.web3 = web3;
    }

    initEventHandler(onData) {
        const blackHole = this.blackHole;

        blackHole.events.TeleportToAccount({
            // fromBlock: 0
        })
            .on('data', function (event) {
                const { eosAccount, tokens } = event.returnValues;

                if (onData)
                    onData(eosAccount, tokens);
                else
                    console.log("(WW) no hadler function installer. Received (" + eosAccount + ", " + tokens + ")");
            })
            .on('changed', function (event) {
                // remove event from local database
            })
            .on('error', console.error);
    }

    initBlackHole(abi, address) {
        const web3 = this.web3;

        check(web3.utils.isAddress(address), "validating blackhole address");
        const blackHole =  new web3.eth.Contract(abi, address);
        check(blackHole, "create instance to blackhole contract");
        check(blackHole.options.address === web3.utils.toChecksumAddress(address), "instance has correct address");
        web3.eth.getCode(address).then(result => console.log("(II) bytecode hash: " + web3.utils.sha3(result)))
        this.blackHole = blackHole;
    }

    teleport() {
        const soc = socket.createSocket('rep');

        process.on('SIGINT', function () {
            soc.close();
            console.log("... exiting.");
            process.exit();
        });

        console.log("(II) press ctrl+c to exit");
        soc.bindSync('tcp://*:5555');
    };

}

module.exports = WormHoleEosAccount;
