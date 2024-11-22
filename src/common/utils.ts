import { SignerWalletAdapterProps, WalletNotConnectedError, WalletNotReadyError } from '@solana/wallet-adapter-base';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import { AddressLookupTableAccount, ComputeBudgetProgram, Connection, GetProgramAccountsFilter, Keypair, MessageV0, PublicKey, SystemProgram, Transaction, TransactionInstruction, TransactionMessage, VersionedTransaction, clusterApiUrl } from '@solana/web3.js';
import moment, { Moment } from 'moment';
import { md5 } from 'js-md5';
import BigNumber from 'bignumber.js';
import { ELEMENT_CHAOS, ELEMENT_FIRE, ELEMENT_GRASS, ELEMENT_WATER, SOL_DECIMALS } from './constants';

export function sleep(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
        }, ms);
    });
}

/**
 * Returns the number with 'en' locale settings, ie 1,000
 * @param x number
 * @param minDecimal number
 * @param maxDecimal number
 */
 export function toLocaleDecimal(x: number | string, minDecimal: number, maxDecimal: number) {
    x = Number(x);
    return x.toLocaleString('en', {
        minimumFractionDigits: minDecimal,
        maximumFractionDigits: maxDecimal,
    });
}

export const formatCash = (n: number | string, minDecimal?: number) => {
    n = Number(n);
    let decimal = minDecimal ?? 0;
    if (n < 1e3) return n.toFixed(minDecimal);
    if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(decimal) + "K";
    if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(decimal) + "M";
    if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(decimal) + "B";
    if (n >= 1e12) return +(n / 1e12).toFixed(decimal) + "T";
};

/**
 * Runs the function if it's a function, returns the result or undefined
 * @param fn
 * @param args
 */
export const runIfFunction = (fn: any, ...args: any): any | undefined => {
    if(typeof(fn) == 'function'){
        return fn(...args);
    }

    return undefined;
}

/**
 * Returns the ellipsized version of string
 * @param x string
 * @param leftCharLength number
 * @param rightCharLength number
 */
export function ellipsizeThis(x: string, leftCharLength: number, rightCharLength: number) {
    if(!x) {
        return x;
    }

    let totalLength = leftCharLength + rightCharLength;

    if(totalLength >= x.length) {
        return x;
    }

    return x.substring(0, leftCharLength) + "..." + x.substring(x.length - rightCharLength, x.length);
}

/**
 * Returns the new object that has no reference to the old object to avoid mutations.
 * @param obj
 */
export const cloneObj = <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
}

// check if the uuid is valid as sanitization
export const isValidUUID = (uuid: string) => {
    return (uuid.match(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)?.length ?? 0) > 0;
}

// check if the email is valid
export const isValidMail = (email: string) => {
    let matches = email.match(/[\w-\+\.]+@([\w-]+\.)+[\w-]{2,10}/g);
    return matches !== null && matches.length > 0;
}

/**
 * @returns string
 */
export const getRandomColor = () => {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export const getRandomNumber = (min: number, max: number, isInteger = false) => {
    let rand = min + (Math.random() * (max - min));
    if(isInteger) {
        rand = Math.round(rand);
    }

    else {
        // to 3 decimals
        rand = Math.floor(rand * 1000) / 1000;
    }

    return rand;
}

export const getRandomChance = () => {
    return getRandomNumber(0, 100);
}

export const getRandomNumberAsString = (min: number, max: number, isInteger = false) => {
    return getRandomNumber(min, max, isInteger).toString();
}

export const getRandomChanceAsString = () => {
    return getRandomNumberAsString(0, 100);
}

export const getUTCMoment = () => {
    return moment().utc();
}

export const getUTCDatetime = () => {
    return getUTCMoment().format('YYYY-MM-DD HH:mm:ss');
}

export const getUTCDate = () => {
    return getUTCMoment().format('YYYY-MM-DD');
}

export const getBaseUrl = () => {
    return process.env.NEXT_PUBLIC_BASE_URL!;
}

export const getDappDomain = () => {
    return process.env.NEXT_PUBLIC_DAPP_DOMAIN!;
}

export const getWsUrl = () => {
    return process.env.NEXT_PUBLIC_WS_URL!;
}

export const getEmailDomain = () => {
    return process.env.NEXT_PUBLIC_EMAIL_DOMAIN!;
}

export const getRPCEndpoint = (): string => {
    return process.env.NEXT_PUBLIC_RPC_URL? process.env.NEXT_PUBLIC_RPC_URL : clusterApiUrl("devnet");
}

export const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
}

export const ucFirst = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const objectsEqual = (o1: any, o2: any) => {
    try {
        return Object.keys(o1).length === Object.keys(o2).length && Object.keys(o1).every(p => o1[p] === o2[p]);
    }

    catch {
        return false;
    }
}

export const isWeekend = (moment: Moment) => {
    let day = moment.get('day');
    return day === 5 || day === 6; // friday or saturday
}

// converts to k, M, B, T, e15, e18
/* export const convertBigNumberToMillions = (from: BigNumber) => {
    let absolute = from.absoluteValue();
    
    if(absolute.isGreaterThanOrEqualTo(1e15)) {
        return from.toExponential();
    }
    
    if(absolute.isGreaterThanOrEqualTo(1e12)) {
        from = from.div(1e12);
        return from.toFixed(2) + "T";
    }

    return from.toFixed(2);
} */

// converts the day of week and hour to utc time
export const convertToLocalDayAndHour = (day: number, hour: number) => {
    let hourOffset = moment().utcOffset() / 60;
    hour = hour + hourOffset;
            
    if(hour > 23) {
        day++;
        hour -= 24;
    }

    // 
    day = day > 6? 0 : day;
    return { day, hour };
}

// converts the day of week and hour to the local time
export const convertToUtcDayAndHour = (day: number, hour: number) => {
    let hourOffset = moment().utcOffset() / 60;
    hour = hour - hourOffset;
            
    if(hour < 0) {
        day--;
        hour += 24;
    }

    // 
    day = day < 0? 6 : day;
    return { day, hour };
}

export const getSkillIcon = (assetFile: string) => {
    return `/assets/skills/${assetFile}`;
}

export const getMonsterBattleImage = (assetFile: string, isShiny: boolean) => {
    return `/assets/sprites/base${isShiny? '_shiny' : ''}/${assetFile}`;
}

export const getMonsterImage = (assetFile: string, elementId: number, isShiny: boolean) => {
    let file = "";
    switch(elementId) {
        case ELEMENT_GRASS:
            file = "green";
            break

        case ELEMENT_FIRE:
            file = "red";
            break

        case ELEMENT_WATER:
            file = "blue";
            break

        case ELEMENT_CHAOS:
            file = "grey";
            break

        default:
            file = "base";
            break
    }
    file += isShiny? "_shiny" : "";
    return `/assets/sprites/${file}/${assetFile}`;
}

export const getBridgingIcon = (assetFile: string) => {
    return `/assets/gif/${assetFile}.webp`;
}

export const getMonsterIcon = (assetFile: string, elementId: number, isShiny: boolean) => {
    let file = "";
    switch(elementId) {
        case ELEMENT_GRASS:
            file = "green";
            break

        case ELEMENT_FIRE:
            file = "red";
            break

        case ELEMENT_WATER:
            file = "blue";
            break

        case ELEMENT_CHAOS:
            file = "grey";
            break

        default:
            file = "base";
            break
    }
    file = "icon_" + file + (isShiny? "_shiny" : "");
    return `/assets/sprites/${file}/${assetFile}`;
}

export const getEffect = (assetFile: string) => {
    return `/assets/effects/${assetFile}`;
}

export const getChainLogo = (assetFile: string) => {
    return `/assets/chain/${assetFile}.png`;
}

export const getBg = (areaId: number, blur = false) => {
    let folder = blur? "bg_blur" : "bg";
    let name = "grasslands";
    switch(areaId) {
        case 1:
            name = "town";
            break;
        case 2:
            name = "forest";
            break;
        case 3:
            name = "grasslands";
            break;
        case 4:
            name = "volcano";
            break;
        case 5:
            name = "underground";
            break;
        case 6:
            name = "sunken";
            break;
        case 7:
            name = "island";
            break;
        case 8:
            name = "sky";
            break;
        default:
            break;
    }
    return `/assets/${folder}/${name}_bg.jpg`;
}

export const getAreaName = (areaId: number, blur = false) => {
    let name = "grasslands";
    switch(areaId) {
        case 1:
            name = "Town";
            break;
        case 2:
            name = "Forest";
            break;
        case 3:
            name = "Grasslands";
            break;
        case 4:
            name = "Volcano";
            break;
        case 5:
            name = "Underground";
            break;
        case 6:
            name = "Sunken City";
            break;
        case 7:
            name = "Island";
            break;
        case 8:
            name = "Sky City";
            break;
        default:
            break;
    }
    return name;
}

export const getAreaAudio = (areaId: number) => {
    let name = "map_world";
    switch(areaId) {
        case 1:
            name = "map_village";
            break;
        case 2:
            name = "map_forest";
            break;
        case 3:
            name = "map_grasslands";
            break;
        case 4:
            name = "map_volcano";
            break;
        case 5:
            name = "map_underworld";
            break;
        case 6:
            name = "map_sunken";
            break;
        case 7:
            name = "map_island";
            break;
        case 8:
            name = "map_sky";
            break;
        default:
            break;
    }
    return name;
}

export const truncateStr = (fullStr: string, strLen: number, separator='..') => {
    if (fullStr.length <= strLen) return fullStr;

    var sepLen = separator.length,
        charsToShow = strLen - sepLen,
        frontChars = Math.ceil(charsToShow/2),
        backChars = Math.floor(charsToShow/2);

    return fullStr.substr(0, frontChars) +
           separator +
           fullStr.substr(fullStr.length - backChars);
}

export const getElementTooltip = (elementId: number) => {
    switch(elementId) {
        case ELEMENT_CHAOS:
            return `\n\nWeakness\tNone\tStrength\t\tNone\nResistant\t\tNone`;
        case ELEMENT_FIRE:
            return `\n\nWeakness\tWater\nStrength\t\tGrass\nResistant\t\tFire`;
        case ELEMENT_GRASS:
            return `\n\nWeakness\tFire\nStrength\t\tWater\nResistant\t\tGrass`;
        case ELEMENT_WATER:
            return `\n\nWeakness\tGrass\nStrength\t\tFire\nResistant\t\tWater`;
        default:
            return ``;
    }
}

// wallet utils
//get associated token accounts that stores the SPL tokens
const getTokenAccounts = async(connection: Connection, address: string) => {
    try {
        const filters: GetProgramAccountsFilter[] = [
            {
            dataSize: 165,    //size of account (bytes), this is a constant
            },
            {
            memcmp: {
                offset: 32,     //location of our query in the account (bytes)
                bytes: address,  //our search criteria, a base58 encoded string
            },            
            }];

        const accounts = await connection.getParsedProgramAccounts(
            new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), //Associated Tokens Program
            {filters: filters}
        );

        return accounts;
    }

    catch {
        return [];
    }
}
export const getUserTokens = async(userAccount: PublicKey) => {
    // load the env variables and store the cluster RPC url
    const CLUSTER_URL = getRPCEndpoint();

    // create a new rpc connection, using the ReadApi wrapper
    const connection = new Connection(CLUSTER_URL, "confirmed");

    let mintObject: {[mintAddress: string]: number} = {};
    let userAccounts = await getTokenAccounts(connection, userAccount.toString());
    for(let account of userAccounts) {
      let anyAccount = account.account as any;
      let mint: string = anyAccount.data["parsed"]["info"]["mint"];
      let accountAmount: number = anyAccount.data["parsed"]["info"]["tokenAmount"]["uiAmount"];

      mintObject[mint] = accountAmount;
    }

    return mintObject;
}

export const getAddressTokenBalance = async(tokenPublicKey: string, publicKey: string) => {
    const balances = await getUserTokens(new PublicKey(publicKey));
    return balances[tokenPublicKey] ?? 0;
}

export const configureAndSendCurrentTransaction = async (
  transaction: Transaction,
  connection: Connection,
  feePayer: PublicKey,
  signTransaction: SignerWalletAdapterProps['signTransaction']
) => {
  const blockHash = await connection.getLatestBlockhash();
  transaction.feePayer = feePayer;
  transaction.recentBlockhash = blockHash.blockhash;
  const signed = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction({
    blockhash: blockHash.blockhash,
    lastValidBlockHeight: blockHash.lastValidBlockHeight,
    signature
  });
  return signature;
};

export const sendTokensTo = async(wallet: WalletContextState, sendTo: string, token: string, tokenDecimals: number, amount: number, memo: string) => {
    let { publicKey, signTransaction } = wallet;
    if (!publicKey || !signTransaction) {
      throw new WalletNotConnectedError();
    }

    const connection = new Connection(getRPCEndpoint());

    const mintToken = new PublicKey(token);
    const recipientAddress = new PublicKey(sendTo);

    const transactionInstructions: TransactionInstruction[] = [];

    // get the sender's token account
    const associatedTokenFrom = await getAssociatedTokenAddress(
      mintToken,
      publicKey
    );

    const fromAccount = await getAccount(connection, associatedTokenFrom);
    let {
        associatedTokenTo,
        transaction: createTransaction,
    } = await getOrCreateAssociatedAccount(mintToken, publicKey, recipientAddress);

    if(createTransaction) {
        transactionInstructions.push(createTransaction);
    }

    // the actual instructions
    transactionInstructions.push(
      createTransferInstruction(
        fromAccount.address, // source
        associatedTokenTo, // dest
        publicKey,
        Math.round(amount * tokenDecimals),
      )
    );

    // send the transactions
    let transaction = new Transaction().add(...transactionInstructions);
        
    let memoIx =  new TransactionInstruction({
        keys: [{ pubkey: wallet.publicKey!, isSigner: true, isWritable: true }],
        data: Buffer.from(memo, "utf-8"),
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
    });

    const blockHash = await connection.getLatestBlockhash('confirmed');
    transaction.add(memoIx);
    transaction = addPriorityFeeToTransaction(transaction, 50_000, 200_000);
    transaction.recentBlockhash = blockHash.blockhash;
    transaction.lastValidBlockHeight = blockHash.lastValidBlockHeight;
    
    
    // Send and confirm transaction
    // Note: feePayer is by default the first signer, or payer, if the parameter is not set
    let signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction({
        blockhash: blockHash.blockhash,
        lastValidBlockHeight: blockHash.lastValidBlockHeight,
        signature,
    });
    return signature;
}

// return associatedTokenAddress and transaction
// if associatedTokenAddress exists, transaction is null
export const getOrCreateAssociatedAccount = async(mintToken: PublicKey, payer: PublicKey, recipient: PublicKey) => {
    const connection = new Connection(getRPCEndpoint());

    // get the recipient's token account
    const associatedTokenTo = await getAssociatedTokenAddress(
        mintToken,
        recipient
    );

    let transaction = null;

    // if recipient doesn't have token account
    // create token account for recipient
    if (!(await connection.getAccountInfo(associatedTokenTo))) {
        transaction =
            createAssociatedTokenAccountInstruction(
                payer,
                associatedTokenTo,
                recipient,
                mintToken
            );
    }

    return {
        associatedTokenTo,
        transaction,
    };
}


// quote response = response from jupiter
export const swapAndSendTo = async(wallet: WalletContextState, toMintToken: PublicKey, recipient: PublicKey, quoteResponse: any, memo: string) => {
    if(!wallet) {
        throw new WalletNotReadyError();
    }
    let { publicKey, signTransaction } = wallet;
    if (!publicKey || !signTransaction) {
        throw new WalletNotConnectedError();
    }

    // get associated account
    let {
        associatedTokenTo,
        transaction: createTransaction
    } = await getOrCreateAssociatedAccount(toMintToken, wallet.publicKey!, recipient);

    const transactions = await (
        await fetch('https://quote-api.jup.ag/v6/swap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            // quoteResponse from /quote api
            quoteResponse,
            // Bob will receive the 5 USDC
            destinationTokenAccount: associatedTokenTo.toString(),
            userPublicKey: wallet.publicKey!.toString(),
            dynamicComputeUnitLimit:  true,
            prioritizationFeeLamports: 'auto',
          })
        })
      ).json();
      
      const { swapTransaction } = transactions;
      let txBuf = Buffer.from(swapTransaction, 'base64');
      let tx = VersionedTransaction.deserialize(txBuf as any);
      const connection = new Connection(getRPCEndpoint(), "confirmed");

      const transactionInstructions: TransactionInstruction[] = [];
      if(createTransaction) {
        transactionInstructions.push(createTransaction);
      }
        
      let memoIx =  new TransactionInstruction({
          keys: [{ pubkey: wallet.publicKey!, isSigner: true, isWritable: true }],
          data: Buffer.from(memo, "utf-8"),
          programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      });
      transactionInstructions.push(memoIx);

      let prioritizedTx = await addAdditionalIxsToVersionedTransaction(connection, tx, transactionInstructions);

      const blockHash = await connection.getLatestBlockhash('confirmed');
      const signature = await wallet.sendTransaction(prioritizedTx, connection);
      await connection.confirmTransaction({
          blockhash: blockHash.blockhash,
          lastValidBlockHeight: blockHash.lastValidBlockHeight,
          signature,
      });
      return signature;
}

export const getContentPaymentAddress = () => {
    return process.env.NEXT_PUBLIC_PAYMENT_CONTENT_TO!;
}


export const getAddressSOLBalance = async(publicKey: PublicKey) => {
    // load the env variables and store the cluster RPC url
    const CLUSTER_URL = getRPCEndpoint();

    // create a new rpc connection, using the ReadApi wrapper
    const connection = new Connection(CLUSTER_URL, "confirmed");

    const result = await connection.getBalance(publicKey);
    return result / 1000000000;
}


export const sendSOLTo = async(wallet: WalletContextState, account: string, amount: number, memo: string) => {
    if(!wallet || !wallet.publicKey) {
        throw Error("Wallet not connected");
    }
    // load the env variables and store the cluster RPC url
    const CLUSTER_URL = getRPCEndpoint();

    // create a new rpc connection, using the ReadApi wrapper
    const connection = new Connection(CLUSTER_URL, "confirmed");
    let publicKey = new PublicKey(account);

    let lamports = Math.round(amount * SOL_DECIMALS);
    let transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: publicKey,
            lamports,
        })
    );
        
    let memoIx =  new TransactionInstruction({
        keys: [{ pubkey: wallet.publicKey, isSigner: true, isWritable: true }],
        data: Buffer.from(memo, "utf-8"),
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
    });

    const blockHash = await connection.getLatestBlockhash('confirmed');
    transaction.add(memoIx);
    transaction = addPriorityFeeToTransaction(transaction, 50_000, 200_000);
    transaction.recentBlockhash = blockHash.blockhash;
    transaction.lastValidBlockHeight = blockHash.lastValidBlockHeight;
    
    // Send and confirm transaction
    // Note: feePayer is by default the first signer, or payer, if the parameter is not set
    let signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction({
        blockhash: blockHash.blockhash,
        lastValidBlockHeight: blockHash.lastValidBlockHeight,
        signature,
    });
    return signature;
}

export const getMessageFromVersionedTransaction = async(connection: Connection, tx: VersionedTransaction) => {
    const addressLookupTableAccounts = await Promise.all(
        tx.message.addressTableLookups.map(async (lookup) => {
          return new AddressLookupTableAccount({
            key: lookup.accountKey,
            state: AddressLookupTableAccount.deserialize(await connection.getAccountInfo(lookup.accountKey).then((res) => res!.data) as any),
          })
    }));

    var message = TransactionMessage.decompile(tx.message,{ addressLookupTableAccounts });

    return { addressLookupTableAccounts, message };
}

// add to the front
export const addAdditionalIxsToVersionedTransaction = async(connection: Connection, tx: VersionedTransaction, additionalBackIxs: TransactionInstruction[], additionalFrontIxs?: TransactionInstruction[]) => {
    let { addressLookupTableAccounts, message } = await getMessageFromVersionedTransaction(connection, tx);

    if(additionalFrontIxs && additionalFrontIxs.length > 0) {
        additionalFrontIxs.forEach(ix => message.instructions.unshift(ix));
    }

    if(additionalBackIxs && additionalBackIxs.length > 0) {
        additionalBackIxs.forEach(ix => message.instructions.push(ix));
    }
    
    tx.message = message.compileToV0Message(addressLookupTableAccounts);
    return tx;
}

export const addPriorityFeeToTransaction = (tx: Transaction, microLamports: number, limit: number) => {
    // Create the priority fee instructions
    const computePriceIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports,
    });

    const computeLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: limit,
    });

    tx.instructions.unshift(computePriceIx);
    tx.instructions.unshift(computeLimitIx);

    return tx;
}

// quote response = response from jupiter
export const swapAndSendSolTo = async(wallet: WalletContextState, recipient: PublicKey, amountSol: number, quoteResponse: any, memo: string) => {
    if(!wallet || !wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet not connected");
    }
    
    const connection = new Connection(getRPCEndpoint(), "confirmed");
    while(true) {
        try {
            // let priorityFee = Math.ceil(0.003 * SOL_DECIMALS);
            const transactions = await (
                await fetch('https://quote-api.jup.ag/v6/swap', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    // quoteResponse from /quote api
                    quoteResponse,
                    // destinationTokenAccount: associatedTokenTo.toString(),
                    userPublicKey: wallet.publicKey.toString(),
                    // feeAccount,
                    dynamicComputeUnitLimit: true, // allow dynamic compute limit instead of max 1,400,000
                    // custom priority fee
                    // prioritizationFeeLamports: priorityFee
                    prioritizationFeeLamports: 'auto' 
                  })
                })
            ).json();
            
            const { swapTransaction } = transactions;
            let txBuf = Buffer.from(swapTransaction, 'base64');
            let tx = VersionedTransaction.deserialize(txBuf as any);
            const blockHash = await connection.getLatestBlockhash('confirmed');
        
            // send to deposit address
            let transferIx = SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: recipient,
                lamports: Math.floor(amountSol * SOL_DECIMALS),
            });
            let memoIx =  new TransactionInstruction({
                keys: [{ pubkey: wallet.publicKey, isSigner: true, isWritable: true }],
                data: Buffer.from(memo, "utf-8"),
                programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
            });
        
            let prioritizedTx = await addAdditionalIxsToVersionedTransaction(connection, tx, [transferIx, memoIx]);
        
            const signature = await wallet.sendTransaction(prioritizedTx, connection);
            await connection.confirmTransaction({
                blockhash: blockHash.blockhash,
                lastValidBlockHeight: blockHash.lastValidBlockHeight,
                signature,
            });
        
            return signature;
        }

        catch(e: any) {
            if(e.message.includes("Transaction simulation failed")) {
                // delay
                console.log('transaction simulation error');
                await sleep(100);
                continue;
            }

            console.log('not simulation error');
            console.log(e.message);
            return "";
        }
    }
}

export const signAndSendIx = async(wallet: WalletContextState, ix: TransactionInstruction, memo: string) => {
    if(!wallet || !wallet.publicKey) {
        throw Error("Wallet not connected");
    }
    // load the env variables and store the cluster RPC url
    const CLUSTER_URL = getRPCEndpoint();

    // create a new rpc connection, using the ReadApi wrapper
    const connection = new Connection(CLUSTER_URL, "confirmed");
        
    let memoIx =  new TransactionInstruction({
        keys: [{ pubkey: wallet.publicKey, isSigner: true, isWritable: true }],
        data: Buffer.from(memo, "utf-8"),
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
    });

    const blockHash = await connection.getLatestBlockhash('confirmed');
    const messageV0 = new TransactionMessage({
        payerKey: new PublicKey(wallet.publicKey.toBase58()),
        recentBlockhash: blockHash.blockhash,
        instructions: [ix, memoIx],
      }).compileToV0Message();

    let transaction = new VersionedTransaction(messageV0);
    
    // Send and confirm transaction
    // Note: feePayer is by default the first signer, or payer, if the parameter is not set
    let signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction({
        blockhash: blockHash.blockhash,
        lastValidBlockHeight: blockHash.lastValidBlockHeight,
        signature,
    });
    return signature;
}

export const signAndSendMessageV0 = async(wallet: WalletContextState, messageV0: MessageV0, quoteResponse?: any) => {
    if(!wallet || !wallet.publicKey) {
        return;
    }

    let swapTx: VersionedTransaction | null = null;
    
    // load the env variables and store the cluster RPC url
    const CLUSTER_URL = getRPCEndpoint();

    // create a new rpc connection, using the ReadApi wrapper
    const connection = new Connection(CLUSTER_URL, "confirmed");
    const blockHash = await connection.getLatestBlockhash('confirmed');

    if(quoteResponse) {
        try {
            // let priorityFee = Math.ceil(0.003 * SOL_DECIMALS);
            const transactions = await (
                await fetch('https://quote-api.jup.ag/v6/swap', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    // quoteResponse from /quote api
                    quoteResponse,
                    // destinationTokenAccount: associatedTokenTo.toString(),
                    userPublicKey: wallet.publicKey.toString(),
                    // feeAccount,
                    dynamicComputeUnitLimit: false, // allow dynamic compute limit instead of max 1,400,000
                    // custom priority fee
                    // prioritizationFeeLamports: priorityFee
                    prioritizationFeeLamports: 'auto' 
                  })
                })
            ).json();
            
            const { swapTransaction } = transactions;
            let txBuf = Buffer.from(swapTransaction, 'base64');
            swapTx = VersionedTransaction.deserialize(txBuf as any);
        }
    
        catch(e: any) {
           throw Error(e.message);
        }
    }

    let tx = new VersionedTransaction(messageV0);
    let { message: txMessage } = await getMessageFromVersionedTransaction(connection, tx);
    let transaction = swapTx? await addAdditionalIxsToVersionedTransaction(connection, swapTx, txMessage.instructions) : tx;

    // Send and confirm transaction
    // Note: feePayer is by default the first signer, or payer, if the parameter is not set
    let signature = await wallet.sendTransaction(transaction, connection, { skipPreflight: true });
    await connection.confirmTransaction({
        blockhash: blockHash.blockhash,
        lastValidBlockHeight: blockHash.lastValidBlockHeight,
        signature,
    });
    return signature;
}


export const getIsTransactionSuccessful = async(txHash: string) => {
    const CLUSTER_URL = getRPCEndpoint();
    const connection = new Connection(CLUSTER_URL, "confirmed");
    let tx = await connection.getTransaction(txHash, { maxSupportedTransactionVersion: 0 });
    if(!tx) {
        return false;
    } 

    if(!tx.meta) {
        return false;
    }

    return tx.meta.err === null;
}

export const isProduction = () => {
    return process.env.NEXT_PUBLIC_IS_PRODUCTION === 'true';
}

export const getExplorerLink = (txHash: string) => {
    return `https://solana.fm/tx/${txHash}${isProduction()? "" : "?cluster=devnet-alpha"}`;
}