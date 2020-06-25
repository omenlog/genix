import {
  exec,
  register,
  onEvent,
  emit,
  g,
  mapEvents,
  testTools,
  command,
} from '../src';

function* getUser(userName: string) {
  let user = yield command('read-user-from-cache', userName);
  if (!user) {
    yield emit('user-not-found', userName);
    user = yield command('get-user-data', userName);
  }

  return user.email;
}

describe('Sources', () => {
  beforeEach(() => {
    testTools.clearCommands();
    expect.hasAssertions();
  });
  it('should allow execute sources', () => {
    const testFn = jest.fn();
    function* testSrc() {
      testFn();
    }

    exec(testSrc);
    expect(testFn).toHaveBeenCalled();
  });

  it('should allow execute sources passing some values as arguments ', () => {
    const testFn = jest.fn();
    function* testSrc(arg: number) {
      testFn(arg);
    }

    exec(testSrc, 1);
    expect(testFn).toHaveBeenCalledWith(1);
  });

  it('should allow  register new sources from sources', () => {
    const testFn = jest.fn();

    function* newSrc() {
      testFn();
    }

    function* testSrc() {
      yield register(newSrc);
    }

    exec(testSrc);
    expect(testFn).toHaveBeenCalled();
  });

  it('should export a function that make easier integration with cb handlers', (done) => {
    const testFn = jest.fn();
    function* handler() {
      testFn();
    }

    function* source() {
      yield onEvent('async-event', handler);
    }

    function* timeOutHandler() {
      yield emit('async-event');
      expect(testFn).toHaveBeenCalled();
      done();
    }

    exec(source);
    setTimeout(g(timeOutHandler), 0);
  });

  test('g function allow pass arguments to inner source', () => {
    const testFn = jest.fn();
    function* testSrc(name: string) {
      testFn(name);
    }

    const handler = g(testSrc);
    handler('omar');
    expect(testFn).toHaveBeenCalledWith('omar');
  });

  test('g function allow get sources return values', async () => {
    function* src() {
      return 10;
    }

    const handler = g(src);
    const result = await handler();
    expect(result).toBe(10);
  });

  it('should allow map one event from incoming source to an event of external source', async () => {
    const testFn = jest.fn();

    const eventMap = {
      'event-1': 'event-2',
    };

    function* externalSrc() {
      yield onEvent('event-2', function* () {
        testFn();
      });
    }

    function* internalSrc() {
      yield onEvent('event-1', function* () {
        return 10;
      });
      yield emit('event-1');
    }

    await exec(externalSrc);

    await mapEvents(eventMap);

    await exec(internalSrc);
    expect(testFn).toHaveBeenCalled();
  });

  it('should allow map event from incoming source to varios events of external sources', async () => {
    const testFn = jest.fn();

    const eventMap = {
      'event-11': ['event-12', 'event-13'],
    };

    function* externalSrc1() {
      yield onEvent('event-12', function* src() {
        testFn();
      });
    }

    function* externalSrc2() {
      yield onEvent('event-13', function* src() {
        testFn();
      });
    }

    function* internalSrc() {
      yield onEvent('event-11', function* a() {
        return 10;
      });
      yield emit('event-11');
    }

    await exec(externalSrc1);
    await exec(externalSrc2);

    await mapEvents(eventMap);

    await exec(internalSrc);
    expect(testFn).toHaveBeenCalledTimes(2);
  });

  it('should pass event arguments during event mapping', async () => {
    const testFn = jest.fn();

    function* externalSrc() {
      yield onEvent('event-22', function* (...args: any[]) {
        testFn(...args);
      });
    }

    function* internalSrc() {
      yield onEvent('event-21', function* () {
        return 10;
      });
      yield emit('event-21', 10);
    }

    const eventsMap = {
      'event-21': 'event-22',
    };

    await exec(externalSrc);
    await mapEvents(eventsMap);
    await exec(internalSrc);

    expect(testFn).toHaveBeenCalledWith(10);
  });

  it('should throw and error is the user try to execute and invalid operation', () => {
    function* source() {
      yield {
        type: 'invalid operation',
        eventName: 'invalid',
        handlerFn: () => {},
      };
    }

    expect(exec(source as any)).rejects.toThrow();
  });

  describe('Test Source Utils', () => {
    const userEmail = 'user@email.com';
    const commands = {
      'read-user-from-cache': () => undefined,
      'get-user-data': (userName: any) => ({
        name: userName,
        email: userEmail,
      }),
    };
    test('sources can be executed using mocked commands', async () => {
      const { result, events } = await testTools.exec(
        () => getUser('omar'),
        commands
      );
      expect(events['user-not-found'].args[0]).toBe('omar');
      expect(result).toBe(userEmail);
    });

    test('sources can used mocked commands', async () => {
      const fakeCommands = {
        ...commands,
        ...{ 'read-user-from-cache': () => ({ email: 'test@user.com' }) },
      };

      const { result } = await testTools.exec(
        () => getUser('test'),
        fakeCommands
      );

      expect(result).toBe('test@user.com');
    });
  });
});
