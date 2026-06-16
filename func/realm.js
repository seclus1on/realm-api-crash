const XboxAPI = require("./xbox.js");

class realmAPI extends XboxAPI {
    constructor(crash = { enabled: false, loop: 0 }, debug = false) {
        super();
        this.maxRetries = 3;
        this.crash = crash;
        this.debug = debug;
    }

    async init() {
        this.authToken = await this.getXboxToken("https://pocket.realms.minecraft.net/");
        this.headers = {
            authorization: this.authToken,
            Accept: "*/*",
            charset: "utf-8",
            "client-ref": "6e8fe469150fb2a32e233c69a51d7b44d1c01013",
            "client-version": this.crash.enabled ? "26.10" : "1.26.20",
            "x-networkprotocolversion": "944",
            "x-clientplatform": "Windows",
            "content-type": "application/json",
            "user-agent": "MCPE/UWP",
            "Accept-Language": "en-US",
            "Accept-Encoding": "gzip, deflate, br",
            Host: "pocket.realms.minecraft.net",
            Connection: "Keep-Alive"
        };
    }

    async #req(path, options = {}, name = "") { // visions idea ty :)
        if (typeof this.authToken !== "string" && this.authToken?.errorMsg) {
            return { status: 404, body: { errorMsg: this.authToken.errorMsg, errorCode: 404 } };
        }

        const url = typeof path === "string" && path.startsWith("http") ? path : `https://${this.headers.Host}${path}`;

        if (options.body) this.headers["content-length"] = Buffer.byteLength(options.body).toString();

        for (this.retryCount = -1; ; this.retryCount++) {
            if (this.debug) console.log(`${name} request attempt #${this.retryCount + 1} ~ ${options.method || "GET"} ${url}`);
            if (this.retryCount > (this.crash.enabled && path.includes('/join') ? this.crash.loop : this.maxRetries)) {
                return { status: 429, body: { errorMsg: `reached a max amount of requests for ${name}`, errorCode: 429 } };
            }

            try {
                const response = await fetch(url, { ...options, headers: this.headers, signal: AbortSignal.timeout(15000) });

                if (response.status === 429) return { status: 429, body: { errorMsg: "rate limited, try again later.", errorCode: 429 } };

                if ([502, 503, 504].includes(response.status) || response.status >= 500) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }

                const text = await response.text();
                let body;

                try { body = JSON.parse(text); } catch { body = text || null; }
                
                return { status: response.status, body };
            } catch (error) {
                if (this.debug) console.error(`${name} failed request; `, error.message || error);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    async getRealmInfo(realmCode, fast = true) {
        let body = null;
        const response = await this.#req(`https://bedrock.frontendlegacy.realms.minecraft-services.net/worlds/v1/link/${realmCode}`, { method: "GET" }, "getRealmInfo");
        if (response.status !== 200) return response;

        body = response.body;

        if (fast) return body;

        const detailedResponse = await this.getRealmInfoByID(body.id);
        if (detailedResponse.status !== 200) return detailedResponse;

        body = detailedResponse.body
        return body;
    }

    async getRealmInfoByID(realmID) {
        return await this.#req(`https://bedrock.frontendlegacy.realms.minecraft-services.net/worlds/${realmID}`, { method: "GET" }, "getRealmInfoByID");
    }

    async getRealmIP(realmID) {
        return await this.#req(`https://bedrock.frontendlegacy.realms.minecraft-services.net/worlds/${realmID}/join`, { method: "GET" }, "getRealmIP");
    }

    async postStorySettings(realmID, notifications, autostories, coordinates, timeline) {
        const body = JSON.stringify({ timeline, autostories, coordinates, notifications, playerOptIn: "OPT_IN", realmOptIn: "OPT_IN" });
        return await this.#req(`https://bedrock.frontendlegacy.realms.minecraft-services.net/worlds/${realmID}/stories/settings`, { method: "POST", body, retryServerError: false }, "postStorySettings");
    }

    async getStory(realmID) {
        return await this.#req(`https://frontend.realms.minecraft-services.net/api/v1.0/worlds/${realmID}/stories`, { method: "GET" }, "getStory");
    }

    async getWorlds() {
        return await this.#req(`https://bedrock.frontendlegacy.realms.minecraft-services.net/worlds`, { method: "GET" }, "getWorlds");
    }

    async joinRealm(code) {
        return await this.#req(`https://bedrock.frontendlegacy.realms.minecraft-services.net/invites/v1/link/accept/${code}`, { method: "POST" }, "joinRealm");
    }

    async fetchLinks(worldId) {
        return await this.#req(`https://bedrock.frontendlegacy.realms.minecraft-services.net/links/v1?worldId=${worldId}`, { method: "GET" }, "fetchLinks");
    }

    async fetchBlocklist(worldId) {
        return await this.#req(`https://bedrock.frontendlegacy.realms.minecraft-services.net/worlds/${worldId}/blocklist`, { method: "GET" }, "fetchBlocklist");
    }

    async fetchContent(worldId) {
        return await this.#req(`https://bedrock.frontendlegacy.realms.minecraft-services.net/world/${worldId}/content`, { method: "GET" }, "fetchContent");
    }

    async leaveRealm(realmID) {
        return await this.#req(`https://bedrock.frontendlegacy.realms.minecraft-services.net/invites/${realmID}`, { method: "DELETE" }, "leaveRealm")
    }
}

module.exports = realmAPI;