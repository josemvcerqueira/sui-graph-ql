import { AF_EGG } from './constants';

import { log, graphQLClient, writeFile, rpcClient, readFile } from './utils';

import { queryNFTObjects } from './query';
import { pathOr, uniq } from 'ramda';

interface GetNFTObjectsArgs {
  objectType: string;
  after: string | null;
  first: number;
}

export const getNFTObjects = async ({
  objectType,
  after,
  first,
}: GetNFTObjectsArgs) => {
  const result = await graphQLClient.query({
    query: queryNFTObjects,
    variables: { type: objectType, first, after },
  });

  log(result);

  return {
    pageInfo: {
      endCursor: pathOr(
        '',
        ['data', 'objects', 'pageInfo', 'endCursor'],
        result
      ),
      hasNextPage: pathOr(
        false,
        ['data', 'objects', 'pageInfo', 'hasNextPage'],
        result
      ),
    },
    nfts: pathOr([], ['data', 'objects', 'nodes'], result).map((node) => ({
      owner: pathOr('', ['owner', 'owner', 'address'], node),
      content: pathOr({ id: '' }, ['asMoveObject', 'contents', 'json'], node),
    })),
  };
};

(async () => {
  let after = null;
  let results = [];
  let objects = await getNFTObjects({
    objectType: AF_EGG,
    after,
    first: 50,
  });

  log(objects);

  results.push(...objects.nfts.filter((egg: any) => !!egg.owner));
  after = objects.pageInfo.endCursor;

  while (after) {
    objects = await getNFTObjects({
      objectType: AF_EGG,
      after,
      first: 50,
    });

    results.push(...objects.nfts.filter((egg: any) => !!egg.owner));
    after = objects.pageInfo.endCursor;
  }

  log(results.length);

  await writeFile(
    `${__dirname}/../data/af-egg-holders.json`,
    JSON.stringify(
      results.map((x) => ({
        holder: x.owner,
        nft: x.content.id,
      })),
      null,
      2
    )
  );
})();
