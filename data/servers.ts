import { serverHostname, subdomain } from '~/utils/site';

export interface ServerDefinition {
  name: string;
  version: string;
  imagePath: string;
  hostname: string;
  mapUrl?: string;
  mapUnavailableReason?: string;
}

// The live server roster shown on the landing page.
// Order = display order in the servers grid.
export const servers: ServerDefinition[] = [
  { name: 'ATM10: To the Sky', version: '2.0.2', imagePath: '/img/atm10tts.png', hostname: serverHostname('atm10tts'), mapUrl: `${subdomain('maps')}/atm10tts` },
  { name: 'All The Mods 10', version: '7.1', imagePath: '/img/atm10.png', hostname: serverHostname('atm10'), mapUrl: `${subdomain('maps')}/atm10` },
  { name: 'GregTech: New Horizons', version: '2.8.4', imagePath: '/img/gtnh.png', hostname: serverHostname('gtnh'), mapUrl: `${subdomain('maps')}/gtnh` },
  { name: 'MC Eternal 2', version: '1.2.2.0', imagePath: '/img/mce2-2.png', hostname: serverHostname('mce2'), mapUrl: `${subdomain('maps')}/mce2` },
  { name: 'Prominence 2', version: '3.9.27', imagePath: '/img/p2he.png', hostname: serverHostname('p2he'), mapUrl: `${subdomain('maps')}/p2he` },
  { name: 'StoneBlock 4', version: '1.15.3', imagePath: '/img/sb4.png', hostname: serverHostname('sb4'), mapUnavailableReason: "It's underground, duh" },
  { name: 'Society: Sunlit Valley', version: '4.0.8', imagePath: '/img/sv.png', hostname: serverHostname('sv'), mapUrl: `${subdomain('maps')}/sv` },
];
