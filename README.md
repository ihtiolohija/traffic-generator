# traffic-generator

A Traffic Generator App built with Node.js/Express. 

<br>Prior to running app please make sure you have [NMap](https://nmap.org) utility installed on the working machine. 
<br>To start app please run:
- npm install
- npm start

Some notes: 
- Traffic Generator is developed with open-source library [Node-Nmap](https://github.com/Johnhhorton/node-nmap) which implicitly uses NMap utility. That means, prior to running application, you should have NMap utility installed on the working machine;
- Traffic Generator doesn't need root permissions to be run, so the Node-Nmap built-in method for scanning target host works pretty slow. 
For better performance, another built-in method can be used, however, the library doesn't support an array of additional commands that's needed to retrieve open ports. (However, I added this support to my local environment, didn't want to make public changes to open-source library:).
- Traffic Generator is developed with open-source library for [load testing](https://www.npmjs.com/package/loadtest). Options are generated dynamically and could be changed.
- Currently only HTTP traffic is supported. There's also an option for HTTPS support, however it wasn't properly tested. 
<br>New types of traffic can be added easily (specific implementation should be provided).
