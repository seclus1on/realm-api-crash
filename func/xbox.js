const { Authflow, Titles } = require("prismarine-auth");

class XboxAPI {
  constructor() {
    this.flow = new Authflow(undefined, "./meow", { flow: "sisu", authTitle: Titles.MinecraftAndroid, deviceType: "Android" });
  }

  async getXboxToken(relyingParty) {
    let xboxToken = await this.flow.getXboxToken(relyingParty);

    if (typeof xboxToken.userXUID === "string") this.xuid = xboxToken?.userXUID;

    return `XBL3.0 x=${xboxToken.userHash};${xboxToken.XSTSToken}`;
  }
}

module.exports = XboxAPI;