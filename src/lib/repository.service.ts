import { ICollection, id as convertToMongoId } from 'monk';

export class Repository<T> {
  constructor(private readonly collection: ICollection<T>) {}

  getById(id: string) {
    return this.collection.findOne({ _id: convertToMongoId(id).toHexString() });
  }

  list(query: string | Object) {
    return this.collection.find(query);
  }

  add(model: T) {
    return this.collection.insert(model);
  }

  delete(id: string) {
    return this.collection.remove({
      _id: convertToMongoId(id).toHexString(),
    });
  }

  edit(id: string, model: T, setProperties?: (keyof T)[]) {
    return this.collection.findOneAndUpdate(
      {
        _id: convertToMongoId(id).toHexString(),
      },
      {
        $set:
          setProperties?.length > 0
            ? this.copyOnly(model, setProperties)
            : model,
      },
    );
  }

  private copyOnly<T>(object: T, includedFields: (keyof T)[]) {
    const excludedFields = (Object.keys(object) as Array<keyof T>).filter(
      k => !includedFields.includes(k),
    );

    return this.copyExcept(object, excludedFields);
  }

  private copyExcept<T>(object: T, excludedFields: (keyof T)[]) {
    return excludedFields.reduce(
      (copy, field) => {
        delete copy[field];
        return copy;
      },
      { ...object } as Partial<T>,
    );
  }
}
