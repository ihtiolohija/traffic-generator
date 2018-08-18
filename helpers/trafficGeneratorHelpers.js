const nmap = require('node-nmap');
const loadtest = require('loadtest');
const async = require("async");


const EventEmitter = require('events');
class TrafficGeneratorEmitter extends EventEmitter {}
const trafficGeneratorEmitter = new TrafficGeneratorEmitter();

const supportedServices = ['http', 'https'];
const methods = ['POST', 'PUT', 'GET'];

const generateHttpsOptions = targetOptions=>{
    let random = Math.random();
    return {
        url: `https://${targetOptions.ip}:${targetOptions.port}`,
        secureProtocol: 'TLSv1_method', //TODO more secure protocols could be added
        maxRequests: 50,
        concurrent: 10,
        method: methods[Math.floor(random*methods.length)],
        requestsPerSecond: 5,
        maxSeconds: 30,
        requestGenerator: (params, options, client, callback) => {
            const message = `{"hi": ${random}"}`;
            options.headers['Content-Length'] = message.length;
            options.headers['Content-Type'] = 'application/json';
            options.body = `YourPostData${random}`;
            const request = client(options, callback);
            request.write(message);
            return request;
        }
    }
};

const generateHttpOptions = targetOptions=>{
    let random = Math.random();
    return {
        url: `http://${targetOptions.ip}:${targetOptions.port}`,
        maxRequests: 50,
        concurrent: 10,
        method: methods[Math.floor(random*methods.length)],
        requestsPerSecond: 5,
        maxSeconds: 30,
        requestGenerator: (params, options, client, callback) => {
        const message = `{"hi": ${random}"}`;
        options.headers['Content-Length'] = message.length;
        options.headers['Content-Type'] = 'application/json';
        options.body = `YourPostData${random}`;
        const request = client(options, callback);
        request.write(message);
        return request;
        }
    }
};

const analyzeServices = (networkScanResult, cb) =>{
    let trafficGeneratorObject = {};
    networkScanResult.forEach(el=>{
        let {openPorts, ip} = el;
        if (openPorts.length >0){
            openPorts.forEach(openPort=>{
                let isServiceSupported =  supportedServices.find(service => service===openPort.service);
                if (isServiceSupported){
                    let {port, service} = openPort;
                    trafficGeneratorObject[service] = [];
                    trafficGeneratorObject[service].push({ip, port});
                }
                else {
                    console.log(`${openPort.service} is unsupported type of service`);
                }
            });
        }
    });
    return cb( null, trafficGeneratorObject);
};

const trafficGeneratorHandler = {
    'http'(targetOptions, cb){
        const options = [];
        for (let i = 0; i<5; i++){
            options.push(generateHttpOptions(targetOptions));
        }
        async.map(options, loadtest.loadTest, cb);
    },
    'https'(targetOptions){
        const options = [];
        for (let i = 0; i<5; i++){
            options.push(generateHttpsOptions(targetOptions));
        }
        async.map(options, loadtest.loadTest, cb);
    }
};


trafficGeneratorEmitter.on('init', data => {
    analyzeServices(data, (err, networkServices) => {
        for (let service in networkServices) {
            if (networkServices.hasOwnProperty(service)){
                if (trafficGeneratorHandler[service]) {
                    let targets = networkServices[service];
                    async.map(targets, trafficGeneratorHandler[service], (err, result)=>{
                        if (err){
                            //TODO log error
                            console.log(err);
                        }
                        else{
                            //TODO log traffic generation result
                            console.log(result);
                        }
                    });
                }
            }
        }
    });
});

const performNmapScan = (targetUrl, cb) =>{
    nmap.nmapLocation = 'nmap';
    let nmapScan = new nmap.NmapScan(targetUrl, '-sV');

    nmapScan.on('complete', data =>{
        trafficGeneratorEmitter.emit('init', data);
        return cb();
    });

    nmapScan.on('error', error =>{
        return cb(error);
    });

    nmapScan.startScan();
};

module.exports={
    performNmapScan
};