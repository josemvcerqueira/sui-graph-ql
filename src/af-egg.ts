import { AF_EGG } from './constants';

import { log, graphQLClient, writeFile, rpcClient, readFile } from './utils';
import { chunkArray } from '@polymedia/suitcase-core';
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
      kioskDynamicField: pathOr('', ['owner', 'parent', 'address'], node),
      owner: pathOr('', ['owner', 'owner', 'address'], node),
      content: pathOr({ id: '' }, ['asMoveObject', 'contents', 'json'], node),
    })),
  };
};

(async () => {
  const file = await readFile(
    `${__dirname}/../data/object-kiosk-af-owners.json`
  );
  const kioskObj = JSON.parse(file.toString());

  const x = await readFile(`${__dirname}/../data/kiosk-af-eggs.json`);
  const xArray = JSON.parse(x.toString());

  const result = xArray.map((egg: any) => ({
    ...egg,
    holder: kioskObj[egg.kiosk]?.content?.fields?.owner,
  }));

  log(result.length);

  await writeFile(
    `${__dirname}/../data/af-egg-kiosk-holders`,
    JSON.stringify(result, null, 2)
  );
})();

// (async () => {
//   let after = null;
//   let results = [];
//   let objects = await getNFTObjects({
//     objectType: AF_EGG,
//     after,
//     first: 50,
//   });

//   let kiosks = await rpcClient.multiGetObjects({
//     ids: objects.nfts
//       .filter((egg: any) => !!egg.kioskDynamicField)
//       .map((egg: any) => egg.kioskDynamicField),
//     options: {
//       showOwner: true,
//     },
//   });

//   const dataWithNFTs = kiosks.map((egg: any, index: number) => ({
//     kiosk: egg.data.owner.ObjectOwner,
//     nft: objects.nfts[index].content.id,
//   }));

//   results.push(...dataWithNFTs);
//   after = objects.pageInfo.endCursor;

//   while (after) {
//     objects = await getNFTObjects({
//       objectType: AF_EGG,
//       after,
//       first: 50,
//     });

//     const parsedObjects = objects.nfts.filter(
//       (egg: any) => !!egg.kioskDynamicField
//     );

//     kiosks = await rpcClient.multiGetObjects({
//       ids: parsedObjects.map((egg: any) => egg.kioskDynamicField),
//       options: {
//         showOwner: true,
//       },
//     });

//     log(kiosks);

//     const dataWithNFTs = kiosks.map((egg: any, index: number) => ({
//       kiosk: egg?.data?.owner?.ObjectOwner,
//       nft: parsedObjects[index].content.id,
//     }));

//     results.push(...dataWithNFTs);
//     after = objects.pageInfo.endCursor;
//   }

//   log(results.length);

//   await writeFile(
//     `${__dirname}/../data/kiosk-af-eggs.json`,
//     JSON.stringify(results, null, 2)
//   );
// })();
