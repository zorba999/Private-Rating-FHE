export const CONTRACT_ADDRESS = "0x62A48598c09B10c2Befc317007aF9569482158F2" as `0x${string}`;

const InEuint8 = {
  components: [
    { name: "ctHash", type: "uint256" },
    { name: "securityZone", type: "uint8" },
    { name: "utype", type: "uint8" },
    { name: "signature", type: "bytes" },
  ],
  type: "tuple",
} as const;

export const CONTRACT_ABI = [
  {
    inputs: [{ internalType: "string", name: "_serviceName", type: "string" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
    ],
    name: "RatingSubmitted",
    type: "event",
  },
  {
    inputs: [],
    name: "serviceName",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ratingCount",
    outputs: [{ internalType: "uint32", name: "", type: "uint32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "hasRated",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "encryptedRating", ...InEuint8 }],
    name: "submitRating",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalHandle",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
