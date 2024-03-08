export abstract class EntityService<TEntity extends object> {
  abstract create(data: object, options?: object): Promise<object>;

  abstract deleteById(id: string, options?: object): Promise<object>;

  // abstract findAll(options?: object): Promise<object[]>;

  abstract findById(id: string, options?: object): Promise<object>;

  abstract updateById(id: string, update: Partial<Omit<TEntity, 'id'>>, options?: object): Promise<object>;
}
