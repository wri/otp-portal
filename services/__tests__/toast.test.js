import { describe, it, expect, beforeEach } from 'vitest';
import toast, { getToasts, removeToast, subscribe } from 'services/toast';

describe('toast', () => {
  beforeEach(() => {
    getToasts().forEach((t) => removeToast(t.id));
  });

  it('puts the newest toast first', () => {
    toast.success('Saved', 'one');
    toast.error('Error', 'two');
    expect(getToasts().map((t) => [t.type, t.message])).toEqual([['error', 'two'], ['success', 'one']]);
  });

  it('ignores a duplicate of a toast still on screen', () => {
    toast.info('Hi', 'there');
    toast.info('Hi', 'there');
    expect(getToasts()).toHaveLength(1);
  });

  it('notifies subscribers and removes by id', () => {
    let calls = 0;
    const unsubscribe = subscribe(() => calls++);
    toast.success('Saved');
    removeToast(getToasts()[0].id);
    unsubscribe();
    toast.success('Saved again');
    expect(calls).toBe(2);
    expect(getToasts()).toHaveLength(1);
  });
});
