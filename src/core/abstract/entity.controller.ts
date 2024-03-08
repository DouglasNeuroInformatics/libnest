/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class EntityController<TEntity extends object> {
  abstract create(entity: object, ...args: any[]): object;

  abstract deleteById(id: string, ...args: any[]): object;

  // abstract findAll(...args: any[]): Promise<object[]>;

  abstract findById(id: string, ...args: any[]): Promise<object>;

  abstract updateById(id: string, update: Partial<Omit<TEntity, 'id'>>, ...args: any[]): Promise<object>;
}
