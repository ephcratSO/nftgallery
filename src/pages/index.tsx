import Image from "next/image";
import { Inter } from "next/font/google";
import { useMemo, useState } from "react";
import { NFTCard } from "@/components/NFTCard";
import { useQuery } from "@tanstack/react-query";

const inter = Inter({ subsets: ["latin"] });

const apiKey = process.env.NEXT_PUBLIC_API_KEY;
const fetchNFTs = async ({ queryKey }) => {
  const [wallet] = queryKey;

  const baseURL = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}/getNFTs/`;
  const requestOptions = { method: "GET" };
  const fetchURL = `${baseURL}?owner=${wallet}`;

  const nfts = await fetch(fetchURL, requestOptions).then((data) =>
    data.json()
  );

  return nfts.ownedNfts;
};

const fetchNFTsForCollection = async ({ queryKey }) => {
  const [collection, nextPageKey] = queryKey;

  const requestOptions = { method: "GET" };
  const baseURL = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}/getNFTsForCollection/`;
  let fetchURL = `${baseURL}?contractAddress=${collection}&withMetadata=true`;

  if (nextPageKey) {
    fetchURL += `&nextToken=${nextPageKey}`;
  }

  const nfts = await fetch(fetchURL, requestOptions).then((data) =>
    data.json()
  );

  return nfts;
};

export default function Home() {
  const [wallet, setWalletAddress] = useState("");
  const [collection, setCollectionAddress] = useState("");
  const [fetchForCollection, setFetchForCollection] = useState(false);
  const [filterByFloorPrice, setFilterByFloorPrice] = useState(false);
  const {
    data: NFTs,
    isLoading: NFTsLoading,
    error: NFTsError,
    refetch: refetchNFTs,
  } = useQuery([wallet], fetchNFTs, { enabled: false });

  const {
    data: collectionNFTs,
    isLoading: collectionNFTsLoading,
    error: collectionNFTsError,
    refetch: refetchNFTsForCollection,
  } = useQuery([collection, null], fetchNFTsForCollection, { enabled: false });

  const handleClick = () => {
    if (fetchForCollection) {
      refetchNFTsForCollection();
    } else {
      refetchNFTs();
    }
  };
  const displayedNFTs = useMemo(() => {
    let nfts = fetchForCollection ? collectionNFTs?.nfts : NFTs;
    if (filterByFloorPrice) {
      nfts = nfts
        ?.filter((nft) => nft.contractMetadata.openSea.floorPrice > 0)
        ?.sort(
          (a, b) =>
            b.contractMetadata.openSea.floorPrice -
            a.contractMetadata.openSea.floorPrice
        );
    }
    return nfts;
  }, [fetchForCollection, collectionNFTs, NFTs, filterByFloorPrice]);

  const error = fetchForCollection ? collectionNFTsError : NFTsError;

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-y-3">
      <div className="flex flex-col w-full justify-center items-center gap-y-2">
        <input
          className="text-black  w-1/4 text-center"
          onChange={(e) => {
            setWalletAddress(e.target.value);
          }}
          value={wallet}
          disabled={fetchForCollection}
          type={"text"}
          placeholder="Add your wallet address"
        ></input>
        <input
          className="text-black w-1/4 text-center"
          onChange={(e) => {
            setCollectionAddress(e.target.value);
          }}
          value={collection}
          type={"text"}
          placeholder="Add the collection address"
        ></input>
        <label className="text-gray-600 ">
          <input
            onChange={(e) => {
              setFetchForCollection(e.target.checked);
            }}
            type={"checkbox"}
            className="mr-2"
          ></input>
          Fetch for collection
        </label>
        <label className="text-gray-600 ">
          <input
            onChange={(e) => {
              setFilterByFloorPrice(e.target.checked);
            }}
            type={"checkbox"}
            className="mr-2"
          ></input>
          Sort by floor price (higher to lower)
        </label>
        <button
          className={
            "disabled:bg-slate-500 text-white bg-blue-400 px-4 py-2 mt-3 rounded-sm w-1/5"
          }
          onClick={handleClick}
        >
          Let's go!{" "}
        </button>
      </div>

      <div className="flex flex-wrap gap-y-12 mt-4 w-5/6 gap-x-2 justify-center">
        {error && <div>An error occurred: {error.message}</div>}
        {displayedNFTs &&
          displayedNFTs.map((nft, index) => {
            return <NFTCard nft={nft} key={nft.id.tokenId + index} />;
          })}
      </div>
    </div>
  );
}
