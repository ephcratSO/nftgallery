export const NFTCard = ({ nft }) => {
  const attributes = nft.metadata.attributes;

  return (
    <div className="w-1/4 flex flex-col h-96 rounded-md shadow-md overflow-hidden bg-slate-50">
      <div className="w-full h-1/2">
        <img
          className="object-cover h-full w-full"
          src={nft.media[0].gateway}
        ></img>
      </div>
      <div className="flex flex-col p-4 h-1/2 overflow-auto text-center">
        <h2 className="text-xl text-gray-800 mb-2">{nft.title}</h2>
        <div>
          {attributes?.map((attribute, index) => (
            <div key={index} className="mb-1 text-center">
              <span className="text-gray-600 font-bold">
                {attribute.trait_type}:
              </span>
              <span className="text-gray-600">{attribute.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
