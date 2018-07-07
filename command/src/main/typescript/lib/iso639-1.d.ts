declare module 'iso-639-1' {
    interface LRes {
        language: string;
        code: string;
    }
    export function getLanguages(codes: string[]): LRes;
    export function getName(code: string): string;
    export function getAllNames(): string[];
    export function getNativeName(code: string): string;
    export function getAllNativeNames(): string[];
    export function getCode(name: string): string;
    export function getAllCodes(): string[];
    export function validate(code: string): boolean;
}
