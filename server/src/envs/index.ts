import { Provider, InfuraProvider, JsonRpcProvider } from 'ethers/providers';
// import { Wallet, getDefaultProvider } from 'ethers';
import { Wallet } from 'ethers';
import { Address, Layer } from '../types';

export interface EnvVariables {
  provider: Provider;
  layer: Layer;
  poapAdmin: Wallet;
  poapAddress: Address;
  poapVoteAddress: Address;
  poapHelpers: PoapHelpers;
  secretKey: string;
  infuraNet: string;
  providerStr: string;
  swaggerHost: string;
  swaggerUrl: string;
  auth0AppName: string;
  auth0Kid: string;
  auth0Audience: string;
  googleStorageBucket: string;
  newEventEmailTemplate: string;
  newEventTemplateEmailTemplate: string;
  redeemTokensEmailTemplate: string;
  senderEmail: string;
  adminEmails: string[];
  awsRegion: string;
  awsAccessKey: string;
  awsSecretAccessKey: string;
  l1_subgraph_url: string;
  l2_subgraph_url: string;
}

export interface PoapHelpers {
  [address: string]: Wallet;
}

function getHelperWallets(provider: Provider) {
  let helpers: any = {}
  const helpersPK = ensureEnvVariable('POAP_HELPERS_PK')
  const ownerPK = ensureEnvVariable('POAP_OWNER_PK');

  // Add admin wallet as helper
  let admin_wallet = new Wallet(ownerPK, provider)
  helpers[admin_wallet.address.toLowerCase()] = new Wallet(ownerPK, provider);

  let jsonObj = JSON.parse(helpersPK);
  for (let item of jsonObj) {
    let wallet = new Wallet(item, provider);
    helpers[wallet.address.toLowerCase()] = new Wallet(item, provider);
  }
  return helpers;
}

function getAdminEmails() {
  const adminEmails = ensureEnvVariable('ADMIN_EMAILS')
  return JSON.parse(adminEmails);
}

function ensureEnvVariable(name: string): string {
  if (!process.env[name]) {
    console.error(`ENV variable ${name} is required`);
    process.exit(1);
  }
  return process.env[name]!;
}

function getL1Provider(): Provider {
  let provider: Provider;
  let envProvider = ensureEnvVariable('PROVIDER');
  if(envProvider == 'infura') {
    const infuraNet = ensureEnvVariable('ETH_NETWORK');
    const infuraPK = ensureEnvVariable('INFURA_PK');
    provider = new InfuraProvider(infuraNet, infuraPK);

  } else if(envProvider == 'local') {
    provider = new JsonRpcProvider('http://localhost:9545');

  } else {
    const network = ensureEnvVariable('ETH_NETWORK');
    const provider_url = ensureEnvVariable('PROVIDER_RPC_URL');
    provider = new JsonRpcProvider(provider_url, network);
  }
  return provider;
}

function getL2Provider(): Provider {
  let provider: Provider;
  let envProvider = ensureEnvVariable('L2_PROVIDER');

  if(envProvider == 'local') {
    provider = new JsonRpcProvider('http://localhost:8545');
  } else {
    const provider_url = ensureEnvVariable('L2_PROVIDER_RPC_URL');
    provider = new JsonRpcProvider(provider_url);
  }

  return provider;
}

function getProvider(layer?: Layer): Provider {
  if (layer && layer == Layer.layer2) {
    return getL2Provider()
  }
  return getL1Provider()
} 

export default function getEnv(extraParams?: any): EnvVariables {
  let layer: Layer = Layer.layer1;
  let poapAddress = ensureEnvVariable('POAP_CONTRACT_ADDR');

  if(extraParams && extraParams.layer === Layer.layer2) {
    layer = extraParams.layer;
    poapAddress = ensureEnvVariable('L2_POAP_CONTRACT_ADDR');
  }

  const provider = getProvider(layer);
  
  const ownerPK = ensureEnvVariable('POAP_OWNER_PK');

  return {
    provider,
    layer,
    poapAddress: poapAddress,
    poapVoteAddress: ensureEnvVariable('POAP_VOTE_CONTRACT_ADDR'),
    poapAdmin: new Wallet(ownerPK, provider),
    poapHelpers: getHelperWallets(provider),
    secretKey: ensureEnvVariable('SECRET_KEY'),
    infuraNet: ensureEnvVariable('ETH_NETWORK'),
    providerStr: ensureEnvVariable('PROVIDER'),
    swaggerHost: ensureEnvVariable('SWAGGER_HOST'),
    swaggerUrl: ensureEnvVariable('SWAGGER_URL'),
    auth0AppName: ensureEnvVariable('AUTH0_APP_NAME'),
    auth0Kid: ensureEnvVariable('AUTH0_KID'),
    auth0Audience: ensureEnvVariable('AUTH0_AUDIENCE'),
    googleStorageBucket: ensureEnvVariable('GOOGLE_STORAGE_BUCKET'),
    newEventEmailTemplate: ensureEnvVariable('NEW_EVENT_EMAIL_TEMPLATE'),
    newEventTemplateEmailTemplate: ensureEnvVariable('NEW_EVENT_TEMPLATE_EMAIL_TEMPLATE'),
    redeemTokensEmailTemplate: ensureEnvVariable('REDEEM_TOKENS_EMAIL_TEMPLATE'),
    senderEmail: ensureEnvVariable('SENDER_EMAIL'),
    adminEmails: getAdminEmails(),
    awsRegion: ensureEnvVariable('AWS_REGION'),
    awsSecretAccessKey: ensureEnvVariable('AWS_SECRET_ACCESS_KEY'),
    awsAccessKey: ensureEnvVariable('AWS_ACCESS_KEY'),
    l1_subgraph_url: ensureEnvVariable('L1_POAP_SUBGRAPH_URL'),
    l2_subgraph_url: ensureEnvVariable('L2_POAP_SUBGRAPH_URL'),
  };
}
