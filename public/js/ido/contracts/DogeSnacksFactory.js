export const DogeSnacksFactoryABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "goldenTuckShopAddress_",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "title",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "dogeSnacksId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "presaleAddress",
        "type": "address"
      }
    ],
    "name": "PresaleCreated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getGoldenTuckShopContributionPercentage",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMinimumGoldenTuckShopContributionInWei",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "dogeId",
        "type": "uint256"
      }
    ],
    "name": "getPresaleAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPresalesCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_goldenTuckShopContributionPercentage",
        "type": "uint256"
      }
    ],
    "name": "setGoldenTuckShopContributionPercentage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_minimumGoldenTuckShopContributionInWei",
        "type": "uint256"
      }
    ],
    "name": "setMinimumGoldenTuckShopContributionInWei",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "tokenAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "unsoldTokensDumpAddress",
            "type": "address"
          },
          {
            "internalType": "address[]",
            "name": "whitelistedAddresses",
            "type": "address[]"
          },
          {
            "internalType": "uint256",
            "name": "tokenPriceInWei",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "hardCapInWei",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "softCapInWei",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxInvestInWei",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minInvestInWei",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "openTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "closeTime",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "aboutProject",
            "type": "string"
          }
        ],
        "internalType": "struct DogeSnacksFactory.PresaleInfo",
        "name": "_info",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "listingPriceInWei",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "liquidityAddingTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lpTokensLockDurationInDays",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "liquidityPercentageAllocation",
            "type": "uint256"
          }
        ],
        "internalType": "struct DogeSnacksFactory.PresaleUniswapInfo",
        "name": "_uniInfo",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "saleTitle",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "linkTelegram",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "linkDiscord",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "linkTwitter",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "linkWebsite",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "linkMedium",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "linkWhitepaper",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "linkBannerImage",
            "type": "string"
          }
        ],
        "internalType": "struct DogeSnacksFactory.PresaleStringInfo",
        "name": "_stringInfo",
        "type": "tuple"
      }
    ],
    "name": "createPresale",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
