// Category

export interface Category {
    id: string;
    name: string;
    tags: string[];
    fields: string[];
    headCategory?: string;
    denySubCategories: boolean;
}

export interface FieldCategoryInput {
    categoryId: string;
    fieldIds: string[];
}

export interface TagCategoryInput {
    categoryId: string;
    tagIds: string[];
}

export interface CategoryInput {
    name: string;
    tags: string[];
    entryPermission: Scope;
    headCategoryId?: string;
    denySubCategories: boolean;
    allowedFileTypes: FileType[];
}

// Entry

export interface Entry {
    id: string;
    tags: string[];
    title: string;
    fields: Field[];
    source: string;
    category: string;
    lastEntry?: string;
}

export interface EntryInput {
    tags: string[];
    title: string;
    sourceId: string;
    lastEntryId?: string;
    source: SourceInputHandler;
    fieldInformation: FieldInformationInput[];
}

export interface FieldInformationInput {
    value: string;
    fieldId: string;
}

export interface SourceInputHandler {
    id: string;
    newSource: SourceInput;
}

// Field

export enum FieldType {
    FILE = "FILE",
    TEXT = "TEXT",
    DATE = "DATE",
    RADIO = "RADIO",
    NUMBER = "NUMBER",
    SELECT = "SELECT",
    MARKDOWN = "MARKDOWN",
    DATETIME = "DATETIME",
    CHECKBOX = "CHECKBOX",
}

export interface Field {
    id: string;
    name: string;
    regex: string;
    type: FieldType;
    template: Scope;
    preText: string;
    postText: string;
    hintText: string;
    headline: string;
    category: string;
    optional: boolean;
    placeholder: string;
    validValues: string[];
    allowedFileTypes: FileType[];
}

export interface FieldInput {
    name: string;
    regexId: string;
    type: FieldType;
    headline?: string;
    placeholder?: string;
    validValues: string[];
    postText?: string;
    hintText?: string;
    optional: boolean;
    preText?: string;
    template: Scope;
}

export interface FieldInformation {
    field: Field;
    value?: string;
}

// File

export interface File {
    id: string;
    name: string;
    size: number;
    entry: string;
    accessToken: string;
}

export enum FileType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    FOLDER = "FOLDER",
    DOCUMENT = "DOCUMENT",
}

// Regex

export interface Regex {
    id: string;
    name: string;
    template: Scope;
    validation: string;
}

export interface RegexInput {
    name: string;
    template: Scope;
    validation: string;
}

// Source

export interface Source {
    id: string;
    name: string;
    scope: Scope;
    source: string;
    type: Sourcetype;
}

export interface SourceInput {
    name: string;
    scope: Scope;
    source: string;
    type: SourceType;
}

export enum SourceType {
    VIDEO = "VIDEO",
    PERSON = "PERSON",
    WEBSITE = "WEBSITE",
    LITERATUR = "LITERATUR",
}

export enum Sourcetype {
    WEBSITE,
    VIDEO,
    LITERATUR,
    PERSON,
}

export enum Scope {
    NONE = "NONE",
    CATEGORIES = "CATEGORIES",
    GLOBAL = "GLOBAL",
}

// Tag

export interface TagInput {
    name: string;
    headTagId?: string;
    description?: string;
}

export interface Tag {
    id: string;
    name: string;
    headTag?: Tag;
    subTags: Tag[];
    description: string;
}

