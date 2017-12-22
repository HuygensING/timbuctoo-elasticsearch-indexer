import { Value, FormatterConfig } from './schema';

function checkAllTypesAreHandler(formatterName: never) {
  console.error(formatterName + ' is not handled!');
}

export function valueToString(value: Value, formatters: FormatterConfig): string {
  const formatter = findFirst(formatters, f => f.type === value.type);
  const formatterName = formatter ? formatter.name : 'STRING';

  switch (formatterName) {
      case 'PERSON_NAMES':
          try {
              return JSON.parse(value.value)
                  .components.map((x: { value: string }) => x.value)
                  .join(' ');
          } catch (e) {
              console.error(e);
          }
          return value.value;
      case 'STRING':
          return value.value;
      default:
          checkAllTypesAreHandler(formatterName);
          return value.value;
  }
}

function findFirst<T>(input: T[], filter: (item: T) => boolean): T | undefined {
  for (const item of input) {
      if (filter(item)) {
          return item;
      }
  }
  return undefined;
}