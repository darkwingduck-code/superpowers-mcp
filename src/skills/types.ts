export interface SkillMetadata {
    name: string;
    description: string;
}

export interface SkillFile {
    name: string;
    path: string;
}

export interface Skill {
    metadata: SkillMetadata;
    directoryName: string;
    content: string;
    files: SkillFile[];
}
