import {
  SuiClient,
  SuiObjectResponse,
  getFullnodeUrl,
} from '@mysten/sui/client';
import { SuiGraphQLClient } from '@mysten/sui/graphql';
import util from 'util';
import { pathOr } from 'ramda';
import * as fs from 'fs';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
export const log = (x: any) => console.log(util.inspect(x, false, null, true));
import dotenv from 'dotenv';

dotenv.config();

export const keyPair = Ed25519Keypair.fromSecretKey(
  Uint8Array.from(Buffer.from(process.env.SUI_PRIVATE_KEY!, 'base64')).slice(1)
);

export const suiFullNodeUrl =
  process.env.SUI_FULL_NODE_URL || getFullnodeUrl('mainnet');

export const rpcClient = new SuiClient({
  url: suiFullNodeUrl,
});

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const parseSuiPlayRegistry = (obj: SuiObjectResponse) => {
  return {
    objectId: pathOr('', ['data', 'objectId'], obj),
    type: pathOr('', ['data', 'content', 'type'], obj),
    version: pathOr('', ['data', 'version'], obj),
    exaltedMinted: pathOr(
      '',
      ['data', 'content', 'fields', 'exalted_minted'],
      obj
    ),
    mythicsMinted: pathOr(
      '',
      ['data', 'content', 'fields', 'mythics_minted'],
      obj
    ),
  };
};

export const graphQLClient = new SuiGraphQLClient({
  url: 'https://sui-mainnet.mystenlabs.com/graphql',
});

export const readFile = util.promisify(fs.readFile);

export const writeFile = util.promisify(fs.writeFile);
