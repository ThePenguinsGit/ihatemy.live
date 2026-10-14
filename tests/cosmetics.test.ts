import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cosmeticErrorMessage,
  cosmeticShortfall,
  shopWithOwned,
  cosmeticSoundFilesOf,
  pickSoundFile,
  cosmeticTypeFromSlug,
  equippedOf,
  syncShopWithInventory,
  withSelection,
} from '~/utils/cosmetics';
import type CosmeticItemInterface from '~/interfaces/CosmeticItemInterface';

const item = (over: Partial<CosmeticItemInterface>): CosmeticItemInterface => ({
  id: 'x', type: 'BADGE', typeName: 'Badge', name: 'X', content: 'X', price: 100,
  achievement: null, owned: false, selected: false, nameHtml: null, contentHtml: null, preview: null,
  ...over,
});

test('slugs map to types and unknown slugs to null', () => {
  assert.equal(cosmeticTypeFromSlug('join'), 'JOIN_MESSAGE');
  assert.equal(cosmeticTypeFromSlug('sound'), 'SOUND');
  assert.equal(cosmeticTypeFromSlug('nope'), null);
  assert.equal(cosmeticTypeFromSlug(undefined), null);
});

test('shortfall is never negative', () => {
  assert.equal(cosmeticShortfall({ price: 400 }, 240), 160);
  assert.equal(cosmeticShortfall({ price: 400 }, 1240), 0);
});

test('error messages cover every refusal code', () => {
  assert.match(cosmeticErrorMessage('not_enough_tokens', { shortfall: 160, tokenName: 'PenguTokens' }), /160 PenguTokens short/);
  assert.match(cosmeticErrorMessage('already_owned'), /already own/);
  assert.match(cosmeticErrorMessage('not_for_sale'), /isn't for sale/);
  assert.match(cosmeticErrorMessage('not_owned'), /don't own/);
  assert.match(cosmeticErrorMessage('not_found'), /doesn't exist/);
  assert.match(cosmeticErrorMessage(undefined), /didn't work/);
});

test('withSelection swaps the item in use within one type only', () => {
  const items = [
    item({ id: 'a', selected: true }),
    item({ id: 'b' }),
    item({ id: 'j', type: 'JOIN_MESSAGE', selected: true }),
  ];
  const picked = withSelection(items, 'BADGE', 'b');
  assert.deepEqual(picked.map(i => i.selected), [false, true, true]);
  const cleared = withSelection(items, 'BADGE', null);
  assert.deepEqual(cleared.map(i => i.selected), [false, false, true]);
});

test('syncShopWithInventory copies owned and selected from the inventory', () => {
  const shop = [item({ id: 'a', owned: true, selected: true }), item({ id: 'b' }), item({ id: 'c' })];
  const inventory = [item({ id: 'a', owned: true }), item({ id: 'b', owned: true, selected: true })];
  const synced = syncShopWithInventory(shop, inventory);
  assert.deepEqual(synced.map(i => [i.id, i.owned, i.selected]), [
    ['a', true, false],
    ['b', true, true],
    ['c', false, false],
  ]);
});

test('equippedOf finds the item in use for a type', () => {
  const items = [item({ id: 'a' }), item({ id: 'b', selected: true }), item({ id: 'j', type: 'JOIN_MESSAGE' })];
  assert.equal(equippedOf(items, 'BADGE')?.id, 'b');
  assert.equal(equippedOf(items, 'JOIN_MESSAGE'), undefined);
});

test('nickSegments gives each gradient character its own color and keeps styles', async () => {
  const { nickSegments, nickSegmentStyle } = await import('~/utils/nickRender');
  const segs = nickSegments([
    { text: 'ab', paint: { type: 'gradient', colors: ['#ff0000', '#0000ff'] } },
    { text: 'c', bold: true, paint: { type: 'color', value: 'gold' } },
  ]);
  assert.deepEqual(segs.map(s => [s.text, s.color]), [
    ['a', 'rgb(255, 0, 0)'],
    ['b', 'rgb(0, 0, 255)'],
    ['c', '#FFAA00'],
  ]);
  assert.deepEqual(nickSegmentStyle(segs[2]!), { color: '#FFAA00', fontWeight: 'bold' });
});

test('the full list adds owned items the shop does not sell, after the shop', () => {
  const base = { achievement: null, nameHtml: null, contentHtml: null, preview: null, typeName: 'Badge', content: '', selected: false } as const;
  const shop = [
    { ...base, id: 'a', type: 'BADGE' as const, name: 'A', price: 10, owned: true },
    { ...base, id: 'b', type: 'BADGE' as const, name: 'B', price: 20, owned: false },
  ];
  const inventory = [
    { ...base, id: 'gift', type: 'BADGE' as const, name: 'Gift', price: 0, owned: true },
    { ...base, id: 'a', type: 'BADGE' as const, name: 'A', price: 10, owned: true },
  ];
  assert.deepEqual(shopWithOwned(shop, inventory).map(i => i.id), ['a', 'b', 'gift']);
  assert.deepEqual(shopWithOwned(shop, null).map(i => i.id), ['a', 'b']);
});

test('only SOUND items with files can be played', () => {
  const file = { url: 'https://example.test/levelup', pitch: 1.5, volume: 1, weight: 1 };
  assert.deepEqual(cosmeticSoundFilesOf({ type: 'SOUND', preview: [file] }), [file]);
  assert.equal(cosmeticSoundFilesOf({ type: 'SOUND', preview: null }), null);
  assert.equal(cosmeticSoundFilesOf({ type: 'SOUND', preview: [] }), null);
  assert.equal(cosmeticSoundFilesOf({ type: 'BADGE', preview: [file] }), null);
  assert.equal(cosmeticSoundFilesOf(undefined), null);
});

test('a sound file is picked by weight', () => {
  const f = (url: string, weight: number) => ({ url, pitch: 1, volume: 1, weight });
  const files = [f('a', 1), f('b', 3)];
  assert.equal(pickSoundFile(files, 0)?.url, 'a');
  assert.equal(pickSoundFile(files, 0.24)?.url, 'a');
  assert.equal(pickSoundFile(files, 0.25)?.url, 'b');
  assert.equal(pickSoundFile(files, 0.99)?.url, 'b');
  assert.equal(pickSoundFile([f('a', 0), f('b', 0)], 0.9)?.url, 'a');
  assert.equal(pickSoundFile([]), null);
});
