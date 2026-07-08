// Registers the `~/` alias resolve hook for `node --test` (see hooks.mjs).
import { register } from 'node:module';

register('./hooks.mjs', import.meta.url);
