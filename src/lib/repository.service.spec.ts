import { ICollection, id as convertToMongoId } from 'monk';
import { Repository } from './repository.service';

describe('Repository', () => {
  let repo: Repository<PersonTest>;
  let collection: ICollection<PersonTest>;
  let findOneMock: jest.SpyInstance<Promise<PersonTest>, any[]>;
  let findMock: jest.SpyInstance<Promise<PersonTest[]>, any[]>;
  let insertMock: jest.SpyInstance<Promise<PersonTest>, any[]>;
  let removeMock: jest.SpyInstance<
    Promise<{
      deletedCount: number;
      result: {
        n: number;
        ok: 0 | 1;
      };
    }>,
    any[]
  >;
  let findOneAndUpdateMock: jest.SpyInstance<Promise<PersonTest>, any[]>;

  beforeEach(async () => {
    collection = {
      findOne: () => null,
      find: () => null,
      insert: () => null,
      remove: () => null,
      findOneAndUpdate: () => null,
    } as any;
    findOneMock = jest.spyOn(collection, 'findOne') as any;
    findMock = jest.spyOn(collection, 'find') as any;
    insertMock = jest.spyOn(collection, 'insert') as any;
    removeMock = jest.spyOn(collection, 'remove') as any;
    findOneAndUpdateMock = jest.spyOn(collection, 'findOneAndUpdate') as any;
    repo = new Repository(collection);
  });

  it('getById() should invoke monk collection.findOne()', async () => {
    const id = '507f191e810c19729de860ea';
    findOneMock.mockReturnValue(Promise.resolve(getMockPersonTest()));
    const response = await repo.getById(id);
    expect(response).toEqual(getMockPersonTest());
    expect(findOneMock).toHaveBeenCalledTimes(1);
    expect(findOneMock).toHaveBeenCalledWith({
      _id: convertToMongoId(id).toHexString(),
    });
  });

  it('list() should invoke monk collection.find()', async () => {
    const id = '507f191e810c19729de860ea';
    findMock.mockReturnValue(Promise.resolve([getMockPersonTest()]));
    const response = await repo.list({
      _id: convertToMongoId(id).toHexString(),
    });
    expect(response).toEqual([getMockPersonTest()]);
    expect(findMock).toHaveBeenCalledTimes(1);
    expect(findMock).toHaveBeenCalledWith({
      _id: convertToMongoId(id).toHexString(),
    });
  });

  it('add() should invoke monk collection.insert()', async () => {
    const personTest = getMockPersonTest();
    insertMock.mockReturnValue(Promise.resolve(personTest));
    const response = await repo.add(personTest);
    expect(response).toEqual(getMockPersonTest());
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(insertMock).toHaveBeenCalledWith(personTest);
  });

  it('delete() should invoke monk collection.remove()', async () => {
    const mockDeleteResponse = {
      deletedCount: 1,
      result: {
        n: 1,
        ok: 1 as any,
      },
    };
    removeMock.mockReturnValue(Promise.resolve(mockDeleteResponse));
    const id = '507f191e810c19729de860ea';
    const response = await repo.delete(id);
    expect(response).toEqual(mockDeleteResponse);
    expect(removeMock).toHaveBeenCalledTimes(1);
    expect(removeMock).toHaveBeenCalledWith({
      _id: convertToMongoId(id).toHexString(),
    });
  });

  it('edit() should invoke monk collection.findOneAndUpdateMock() and only set certain properties', async () => {
    const personTest = getMockPersonTest();
    const id = '507f191e810c19729de860ea';
    findOneAndUpdateMock.mockReturnValue(Promise.resolve(personTest));
    const response = await repo.edit(id, personTest, ['profession', 'sex']);
    expect(response).toEqual(personTest);
    expect(findOneAndUpdateMock).toHaveBeenCalledTimes(1);
    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { _id: convertToMongoId(id).toHexString() },
      { $set: { profession: 'Software Engineer', sex: 'M' } },
    );
  });

  it('edit() should invoke monk collection.findOneAndUpdateMock() and set all properties', async () => {
    const personTest = getMockPersonTest();
    const id = '507f191e810c19729de860ea';
    findOneAndUpdateMock.mockReturnValue(Promise.resolve(personTest));
    const response = await repo.edit(id, personTest);
    expect(response).toEqual(personTest);
    expect(findOneAndUpdateMock).toHaveBeenCalledTimes(1);
    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { _id: convertToMongoId(id).toHexString() },
      { $set: personTest },
    );
  });
});

function getMockPersonTest(): PersonTest {
  return {
    name: 'Ben',
    dob: new Date('1988-12-30'),
    sex: 'M',
    profession: 'Software Engineer',
  };
}

class PersonTest {
  name: string;
  dob: Date;
  sex: 'M' | 'F';
  profession: string;
}
