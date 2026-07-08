import { test } from 'node:test';
import assert from 'node:assert/strict';
import { serializeRuns, parseMiniMessage } from '~/utils/miniMessage';
import type { NickRun } from '~/interfaces/NickRun';

// serializeRuns produces the canonical MiniMessage string for given runs.
const serializeCases: [string, NickRun[], string][] = [
  ['plain text', [{ text: 'Steve' }], 'Steve'],
  ['bold', [{ text: 'Steve', bold: true }], '<b>Steve</b>'],
  ['italic', [{ text: 'Steve', italic: true }], '<i>Steve</i>'],
  ['underline', [{ text: 'Steve', underlined: true }], '<u>Steve</u>'],
  ['strike', [{ text: 'Steve', strikethrough: true }], '<st>Steve</st>'],
  ['obfuscated', [{ text: 'Steve', obfuscated: true }], '<obf>Steve</obf>'],
  ['hex color', [{ text: 'Steve', paint: { type: 'color', value: '#ff0000' } }], '<color:#ff0000>Steve</color>'],
  ['named color', [{ text: 'Steve', paint: { type: 'color', value: 'red' } }], '<color:red>Steve</color>'],
  ['gradient', [{ text: 'Steve', paint: { type: 'gradient', colors: ['#ff0000', '#0000ff'] } }], '<gradient:#ff0000:#0000ff>Steve</gradient>'],
  ['rainbow', [{ text: 'Steve', paint: { type: 'rainbow' } }], '<rainbow>Steve</rainbow>'],
  [
    'bold + gradient, paint outermost',
    [{ text: 'St', bold: true, paint: { type: 'gradient', colors: ['#ff0000', '#0000ff'] } }, { text: 'eve' }],
    '<gradient:#ff0000:#0000ff><b>St</b></gradient>eve',
  ],
  [
    'rainbow stays open across an inner bold run (nesting, not fragmentation)',
    [
      { text: 'abc', paint: { type: 'rainbow' } },
      { text: 'de', paint: { type: 'rainbow' }, bold: true },
      { text: 'fg', paint: { type: 'rainbow' } },
    ],
    '<rainbow>abc<b>de</b>fg</rainbow>',
  ],
  [
    'color stays open across an inner bold run',
    [
      { text: 'ab', paint: { type: 'color', value: 'red' } },
      { text: 'cd', paint: { type: 'color', value: 'red' }, bold: true },
    ],
    '<color:red>ab<b>cd</b></color>',
  ],
  [
    'paint stays open across differing inner decorations',
    [
      { text: 'a', paint: { type: 'rainbow' }, bold: true },
      { text: 'b', paint: { type: 'rainbow' }, italic: true },
    ],
    '<rainbow><b>a</b><i>b</i></rainbow>',
  ],
  ['escapes literal <', [{ text: 'a<b' }], 'a\\<b'],
  ['collapses adjacent same-style runs', [{ text: 'St', bold: true }, { text: 'eve', bold: true }], '<b>Steve</b>'],
];

for (const [name, runs, expected] of serializeCases) {
  test(`serialize: ${name}`, () => {
    assert.equal(serializeRuns(runs), expected);
  });
}

// Round-trip: parsing a canonical string then re-serializing is a fixed point.
const roundTrip = [
  '<b>Steve</b>',
  '<color:#ff0000>Steve</color>',
  '<color:red>Steve</color>',
  '<gradient:#ff0000:#0000ff>Steve</gradient>',
  '<rainbow>Steve</rainbow>',
  '<gradient:#ff0000:#0000ff><b>St</b></gradient>eve',
  '<rainbow>abc<b>de</b>fg</rainbow>',
  '<color:red>ab<b>cd</b></color>',
  'a\\<b',
  'Steve',
];

for (const mm of roundTrip) {
  test(`round-trip: ${mm}`, () => {
    assert.equal(serializeRuns(parseMiniMessage(mm)), mm);
  });
}

// Parser tolerance: bare tags and unsupported markup degrade gracefully.
test('parse: bare named color and hex', () => {
  assert.equal(serializeRuns(parseMiniMessage('<red>hi</red>')), '<color:red>hi</color>');
  assert.equal(serializeRuns(parseMiniMessage('<#00ff00>hi</#00ff00>')), '<color:#00ff00>hi</color>');
});

test('parse: unsupported tag falls back to plain text', () => {
  assert.equal(serializeRuns(parseMiniMessage('<click:run_command:/x>hi</click>')), 'hi');
});

test('parse: gradient with <2 colors falls back to plain text', () => {
  assert.equal(serializeRuns(parseMiniMessage('<gradient:#ff0000>x</gradient>')), 'x');
});

test('parse: reset clears active styling', () => {
  assert.equal(serializeRuns(parseMiniMessage('<b>a<reset>b</b>')), '<b>a</b>b');
});
