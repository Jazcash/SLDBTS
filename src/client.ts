import { SLDBClientConfig, SLDBModel } from "./index";
import xmlrpc from "xmlrpc";

// https://github.com/Yaribz/SLDB/blob/master/XMLRPC

const defaultSLDBClientConfig: Partial<SLDBClientConfig> = {
    verbose: false
};

export class SLDBClient {
    protected config: SLDBClientConfig;
    protected client: xmlrpc.Client;

    constructor(config: SLDBClientConfig) {
        this.config = Object.assign({}, defaultSLDBClientConfig, config);

        this.client = xmlrpc.createClient({
            host: this.config.host,
            port: this.config.port
        });
    }

    public async getPref(accountId: number, prefName: string) : Promise<string> {
        const result = await this.request("getPref", accountId, prefName) as string;
        return result;
    }

    public async setPref(accountId: number, prefName: string, value?: string) {
        await this.request("setPref", accountId, prefName, value);
    }

    public async getSkills(modShortName: string, accountIds: number[]) {
        const results = await this.request("getSkills", ...arguments) as SLDBModel.PlayerSkillResult[];
        for (const result of results) {
            const skills = this.parseSkills(result.skills as string[]);
            result.skills = {
                Duel: skills[0],
                FFA: skills[1],
                Team: skills[2],
                TeamFFA: skills[3],
                Global: skills[4],
            };
        }

        return results;
    }

    /**
     * @example ["a2b9d45f75ed28dda0ccec097dccaedd"]
     */
    public async getMatchSkills(matchIds: string[]) : Promise<SLDBModel.MatchResult[]> {
        const results = await this.request("getMatchSkills", ...arguments) as SLDBModel.MatchResult[];
        for (const result of results) {
            for (const player of result.players) {
                const skills = this.parseSkills(player.skills as unknown as string[]);
                player.skills = {
                    before: skills[0],
                    after: skills[1]
                };
            }
        }

        return results;
    }

    public async getLeaderboards(modShortName: string, gameType: SLDBModel.GameType[]) {
        const results = await this.request("getLeaderboards", ...arguments) as SLDBModel.LeaderboardResult[];
        for (const result of results) {
            for (const player of result.players) {
                player.estimatedSkill = parseFloat(player.estimatedSkill as unknown as string);
                player.uncertainty = parseFloat(player.uncertainty as unknown as string);
                player.trustedSkill = parseFloat(player.trustedSkill as unknown as string);
            }
        }

        return results;
    }

    public async getPlayerStats(modShortName: string, accountId: number) : Promise<SLDBModel.PlayerStatsResult> {
        const results = await this.request("getPlayerStats", ...arguments);
        const data = results as unknown as { [key in SLDBModel.GameType]: number[] };

        let globalWins = 0, globalLosses = 0, globalUndecided = 0;
        for (const nums of Object.values(data)) {
            globalLosses += nums[0];
            globalWins += nums[1];
            globalUndecided += nums[2];
        }

        return {
            losses: { Duel: data.Duel[0], FFA: data.FFA[0], Team: data.Team[0], TeamFFA: data.TeamFFA[0], Global: globalLosses },
            wins: { Duel: data.Duel[1], FFA: data.FFA[1], Team: data.Team[1], TeamFFA: data.TeamFFA[1], Global: globalWins },
            undecided: { Duel: data.Duel[2], FFA: data.FFA[2], Team: data.Team[2], TeamFFA: data.TeamFFA[2], Global: globalUndecided }
        };
    }

    public async getPlayerSkillGraphs(modShortName: string, accountId: number) {
        const results = await this.request("getPlayerSkillGraphs", ...arguments);
        return results;
    }

    protected request(endpoint: string, ...data: any) : Promise<SLDBModel.Result[] | object | string> {
        return new Promise(resolve => {
            if (this.config.verbose) {
                console.log(`Request: {username} {password} ${endpoint} ${data.join(" ")}`);
            }

            this.client.methodCall(endpoint, [this.config.username, this.config.password, ...data], (error, data: SLDBModel.Response) => {
                if (this.config.verbose) {
                    console.log(`Response: ${JSON.stringify(data)}`);
                }

                if (error){
                    throw error;
                }

                if (data.status === 1) {
                    throw new Error(`SLDB Authentication error for user: ${this.config.username}`);
                }

                if (data.status === 2) {
                    throw new Error(`SLDB Invalid parameters for method: ${endpoint}`);
                }

                if (data.results) {
                    resolve(data.results);
                } else if (data.result) {
                    resolve(data.result);
                } else {
                    resolve(data);
                }
            });
        });
    }

    protected parseSkills(skillsString: string[]) : SLDBModel.Skill[] {
        return skillsString.map(skillStr => {
            const nums = skillStr.split("|").map(str => parseFloat(str));
            const trustedSkill = nums[0] - (3 * nums[1]); // https://en.wikipedia.org/wiki/TrueSkill
            return {
                estimated: nums[0],
                uncertainty: nums[1],
                trusted: Number(trustedSkill.toFixed(2))
            };
        });
    }
}