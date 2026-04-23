import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
    discoverSkillsFromDirectories,
    resolveSkillsDirectories,
} from "./skills/discovery.js";
import { registerTools } from "./tools/register.js";
import { registerPrompts } from "./prompts/register.js";
import { registerResources } from "./resources/register.js";
import type { Skill } from "./skills/types.js";

export interface ServerOptions {
    skillsDirs?: string[];
}

export interface ServerResult {
    server: McpServer;
    skills: Skill[];
    skillsDirs: string[];
}

export async function createSuperpowersServer(
    options: ServerOptions = {}
): Promise<ServerResult> {
    const skillsDirs =
        options.skillsDirs ?? resolveSkillsDirectories(process.env);

    let skills: Skill[] = [];
    if (skillsDirs.length > 0) {
        const discoveredSkills = await discoverSkillsFromDirectories(skillsDirs);
        const dedupedSkills = new Map<string, Skill>();
        for (const skill of discoveredSkills) {
            dedupedSkills.set(skill.directoryName, skill);
        }
        skills = [...dedupedSkills.values()];
        console.error(
            `superpowers-mcp: discovered ${skills.length} skills from ${skillsDirs.join(", ")}`
        );
    } else {
        console.error(
            "superpowers-mcp: no skills directory found, no skills loaded"
        );
    }

    const server = new McpServer({
        name: "superpowers-mcp",
        version: "0.1.0",
    });

    registerTools(server, skills);
    registerPrompts(server, skills);
    registerResources(server, skills);

    return { server, skills, skillsDirs };
}
