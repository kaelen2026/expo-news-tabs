const os = require("node:os");

// Pick a LAN address Metro can advertise that the phone will actually reach.
// VPN clients (OpenVPN Connect, Cisco AnyConnect) inject virtual interfaces
// in the 198.18.x.x benchmark range which auto-detection otherwise prefers.
if (!process.env.REACT_NATIVE_PACKAGER_HOSTNAME) {
  const skip = (a) => /^(198\.1[89]\.|169\.254\.|100\.64\.)/.test(a);
  for (const addrs of Object.values(os.networkInterfaces() ?? {})) {
    const ip = addrs?.find(
      (a) => a.family === "IPv4" && !a.internal && !skip(a.address),
    );
    if (ip) {
      process.env.REACT_NATIVE_PACKAGER_HOSTNAME = ip.address;
      break;
    }
  }
}

module.exports = require("./app.json");
