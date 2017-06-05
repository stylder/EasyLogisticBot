/* eslint-disable no-new, max-len */
import test from 'ava';
import CompositeResponse from '../../../src/responses/composite-response';
import OptimizedRequestPhone from '../../../src/responses/decorators/optimized-request-phone';
import TextResponse from '../../../src/responses/text-response';
import RequestPhoneResponse from '../../../src/responses/request-phone-response';
import IfResponse from '../../../src/responses/if-response';

test('can be constructed with default parameters', t => {
  const r = new OptimizedRequestPhone(new CompositeResponse());
  t.is(r.type, 'composite');
  t.is(r.origin.type, 'composite');
});

test('should not fail on non-optimizable responses', t => {
  const origin1 = new CompositeResponse();
  const origin2 = new CompositeResponse().add(new TextResponse({ message: 'foo' }));
  const origin3 = new CompositeResponse().add(new RequestPhoneResponse());
  const rr1 = new OptimizedRequestPhone(origin1).responses;
  const rr2 = new OptimizedRequestPhone(origin2).responses;
  const rr3 = new OptimizedRequestPhone(origin3).responses;
  t.is(rr1.length, 0);
  t.is(rr2.length, 1);
  t.is(rr3.length, 1);
});

test('should optimize basic response', t => {
  const origin = new CompositeResponse()
    .add(new TextResponse({ message: 'foo' }))
    .add(new RequestPhoneResponse());
  const optimized = new OptimizedRequestPhone(origin);
  t.is(optimized.responses.length, 1);
  t.is(optimized.responses[0].type, 'request-phone');
  t.is(optimized.responses[0].message, 'foo');
});

test('should optimize nested response', t => {
  const origin = new CompositeResponse()
    .add(new CompositeResponse()
      .add(new TextResponse({ message: 'foo' }))
      .add(new RequestPhoneResponse())
    );
  const optimized = new OptimizedRequestPhone(origin);
  t.is(optimized.responses.length, 1);
  t.is(optimized.responses[0].type, 'composite');
  t.is(optimized.responses[0].responses.length, 1);
  t.is(optimized.responses[0].responses[0].type, 'request-phone');
  t.is(optimized.responses[0].responses[0].message, 'foo');
});

test('should optimize nested response with if', t => {
  const origin = new CompositeResponse()
    .add(new CompositeResponse()
      .add(new IfResponse({
        condition: {},
        ok: new CompositeResponse()
          .add(new TextResponse({ message: 'foo' }))
          .add(new RequestPhoneResponse()),
        err: new CompositeResponse()
          .add(new TextResponse({ message: 'bar' }))
          .add(new RequestPhoneResponse()),
      }))
    );
  const optimized = new OptimizedRequestPhone(origin);
  t.is(optimized.responses.length, 1);
  t.is(optimized.responses[0].type, 'composite');
  t.is(optimized.responses[0].responses.length, 1);
  t.is(optimized.responses[0].responses[0].type, 'if');
  t.is(optimized.responses[0].responses[0].ok.type, 'composite');
  t.is(optimized.responses[0].responses[0].ok.responses.length, 1);
  t.is(optimized.responses[0].responses[0].ok.responses[0].type, 'request-phone');
  t.is(optimized.responses[0].responses[0].ok.responses[0].message, 'foo');
  t.is(optimized.responses[0].responses[0].err.type, 'composite');
  t.is(optimized.responses[0].responses[0].err.responses.length, 1);
  t.is(optimized.responses[0].responses[0].err.responses[0].type, 'request-phone');
  t.is(optimized.responses[0].responses[0].err.responses[0].message, 'bar');
});
