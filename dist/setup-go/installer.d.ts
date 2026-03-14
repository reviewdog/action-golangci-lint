type InstallationType = "dist" | "manifest";
export interface IGoVersionFile {
    filename: string;
    os: string;
    arch: string;
}
export interface IGoVersion {
    version: string;
    stable: boolean;
    files: IGoVersionFile[];
}
export interface IGoVersionInfo {
    type: InstallationType;
    downloadUrl: string;
    resolvedVersion: string;
    fileName: string;
}
export declare function getGo(versionSpec: string, checkLatest: boolean, auth: string | undefined): Promise<string>;
export declare function extractGoArchive(archivePath: string): Promise<string>;
export declare function getInfoFromManifest(versionSpec: string, stable: boolean, auth: string | undefined): Promise<IGoVersionInfo | null>;
export declare function findMatch(versionSpec: string): Promise<IGoVersion | undefined>;
export declare function getVersionsDist(dlUrl: string): Promise<IGoVersion[] | null>;
export declare function makeSemver(version: string): string;
export declare function parseGoVersionFile(versionFilePath: string): string;
export {};
