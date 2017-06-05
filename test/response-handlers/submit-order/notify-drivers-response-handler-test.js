/* eslint-disable no-new, no-unused-vars, max-len */
import test from 'ava';
import NotifyDriversResponseHandler from '../../../src/response-handlers/submit-order/notify-drivers-response-handler';
import NotifyDriversResponse from '../../../src/responses/submit-order/notify-drivers-response';
import checkNotNullTest from '../../helpers/check-not-null.js';
import FirebaseServer from 'firebase-server';
import firebaseDB, { overrideSettings } from '../../../src/firebase-db';
import { ss } from '../../spec-support';
import sinon from 'sinon';
import { loadUser } from '../../../src/factories/user-factory';

overrideSettings({
  STATEFUL_CONNSTR: 'ws://localhost.firebaseio.test:5505',
  STATEFUL_CREDENTIALS_FILE: undefined,
});

let server = null;
const response = new NotifyDriversResponse({ passengerKey: 'cli_1' });

test.before(() => {
  server = new FirebaseServer(5505, 'localhost.firebaseio.test', {
    users: {
      cli_1: {
        userType: 'passenger',
        currentOrderKey: '53845282-693f-4e7a-8479-87d421db6b94',
      },
    },
    orders: {
      '53845282-693f-4e7a-8479-87d421db6b94': {
        foo: 'bar',
      },
    },
  });
});

test.after.always('guaranteed cleanup', () => {
  server.close();
});

checkNotNullTest('response', (args) => { new NotifyDriversResponseHandler(args); });

test('can be constructed with default parameters', t => {
  new NotifyDriversResponseHandler({ response: {} });
  t.pass();
});

test.cb('should load order and query drivers when called', t => {
  t.plan(2);
  loadUser('cli_1').then((user) => {
    const assert = () => {
      t.is(handler.order.state.foo, 'bar'); // eslint-disable-line no-use-before-define
      t.truthy(handler.queryDrivers.calledWith());  // eslint-disable-line no-use-before-define
      t.end();
    };

    const handler = new NotifyDriversResponseHandler({ response, user });
    handler.queryDrivers = ss.sinon.spy();
    handler.call(assert);
  });
});

test('should query drivers with geofire and setup key_entered callback', t => {
  const handler = new NotifyDriversResponseHandler({ response });
  const geoFireQuery = {
    on: ss.sinon.spy(),
  };
  handler.geoFire = {
    query: ss.sinon.stub().returns(geoFireQuery),
  };
  handler.order = { state: { passengerLocation: 'foo' } };
  handler.queryDrivers();
  t.truthy(handler.geoFire.query.calledWith({ center: 'foo', radius: 10 }));
  t.truthy(geoFireQuery.on.calledWith('key_entered', handler.keyEntered));
});

test('should call notify driver method on key_entered callback', t => {
  const spy = ss.sinon.spy();
  const handler = new NotifyDriversResponseHandler({ response, notifyDriver: { call: spy } });
  handler.keyEntered('key', 'location', 'distance');
  t.truthy(spy.calledWith('key', 'distance'));
});
