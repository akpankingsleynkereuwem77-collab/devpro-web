import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContact } from '../server/contact-validation.js';

const validPayload = {
  name: 'Taylor Example', email: 'taylor@example.com', phone: '+234 800 000 0000',
  projectType: 'Web Development', budget: '₦100,000–₦300,000',
  message: 'I would like a responsive website for my small business.'
};

test('accepts a valid contact payload', () => {
  const result = validateContact(validPayload);
  assert.deepEqual(result.errors, {});
  assert.equal(result.value.email, 'taylor@example.com');
});

test('rejects missing or short name and message', () => {
  const result = validateContact({ ...validPayload, name: 'A', message: 'Hi' });
  assert.ok(result.errors.name);
  assert.ok(result.errors.message);
});

test('rejects malformed email and unsupported project type', () => {
  const result = validateContact({ ...validPayload, email: 'not-an-email', projectType: 'Admin access' });
  assert.ok(result.errors.email);
  assert.ok(result.errors.projectType);
});

test('rejects oversized fields', () => {
  const result = validateContact({ ...validPayload, name: 'x'.repeat(101), message: 'x'.repeat(5001) });
  assert.ok(result.errors.name);
  assert.ok(result.errors.message);
});
