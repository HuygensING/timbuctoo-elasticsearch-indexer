export interface Entity {
  uri: string;
  __typename: string;
  rdf_type?: Entity;
  [key: string]: Entity | Value | Entity[] | Value[] | null | undefined | string; // string is just for the uri prop
}

export interface Value {
  value: string;
  type: string;
}

export type FormatterName = 'STRING' | 'PERSON_NAMES';

export type FormatterConfig = Array<{ type: string; name: FormatterName }>;
// This is the type that is serialized to graphql