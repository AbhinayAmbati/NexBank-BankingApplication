/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import { count } from "console";
import { plaidClient } from "../plaid";
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

const {
    APPWRITE_DATABASE_ID : DATABASE_ID,
    APPWRITE_USER_COLLECTION_ID : USER_COLLECTION_ID,
    APPWRITE_BANK_COLLECTION_ID : USER_BANK_ID,
} = process.env; 


export const getUserInfo = async ({ userId }: getUserInfoProps) => {
  try {
    const { Database } = await createAdminClient();

    const user = await Database.listDocuments(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    )

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error)
  }
}

export const signIn = async ({email, password} : signInProps) => {
    try{
        const { account } = await createAdminClient();
        const session = await account.createEmailPasswordSession(email, password);
        const cookieStore = await cookies();
        cookieStore.set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        const user = await getUserInfo({ userId : session.userId });

        return parseStringify(user);
    }catch(err){
        console.error(err);
    }
}

export const signUp = async ({ password, ...userData }: SignUpParams) => {
    const { email, firstName, lastName } = userData;
    
    let newUserAccount;
  
    try {
      const { account, Database } = await createAdminClient();
  
      newUserAccount = await account.create(
        ID.unique(), 
        email, 
        password, 
        `${firstName} ${lastName}`
      );
  
      if(!newUserAccount) throw new Error('Error creating user')
  
      const dwollaCustomerUrl = await createDwollaCustomer({
        ...userData,
        type: 'personal'
      })
  
      if(!dwollaCustomerUrl) throw new Error('Error creating Dwolla customer')
  
      const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);
  
      const newUser = await Database.createDocument(
        DATABASE_ID!,
        USER_COLLECTION_ID!,
        ID.unique(),
        {
          ...userData,
          userId: newUserAccount.$id,
          dwollaCustomerId,
          dwollaCustomerUrl
        }
      )
  
      const session = await account.createEmailPasswordSession(email, password);
  
      (await cookies()).set("appwrite-session", session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });
  
      return parseStringify(newUser);
    } catch (error) {
      console.error('Error', error);
    }
}
  
export async function getLoggedInUser() {
    try {
      const { account } = await createSessionClient();
      const result =  await account.get();

      const user = await getUserInfo({ userId: result.$id });

      return parseStringify(user);
    } catch (error) {
      return error;
    }
}

export const logoutAccount = async () => {
    try{
        const { account } = await createSessionClient();
        const cookieStore = await cookies();
        cookieStore.delete("appwrite-session");
        await account.deleteSession("current");
        return true;
    }catch(err){
        return err;
    }
}

export const createLinkToken = async (user : User) => {
    try{
        const tokenParams = {
            user: {
                client_user_id: user.$id,

            },
            client_name: `${user.firstName} ${user.lastName}`,
            products: ['auth'] as Products[],
            language: 'en',
            country_codes: ['US'] as CountryCode[]
        }

        const response = await plaidClient.linkTokenCreate(tokenParams);

        return parseStringify({linkToken: response.data.link_token});

    }catch(err){
        console.error(err);
    }
}

export const createBankAccount = async({
userId,
bankId,
accountId,
accessToken,
fundingSourceUrl,
sharableId,
} : createBankAccountProps) => {
    try{
        const { Database } = await createAdminClient();

        const bankAccount = await Database.createDocument(DATABASE_ID!,USER_BANK_ID!,ID.unique(), {
            userId,
            bankId,
            accountId,
            accessToken,
            fundingSourceUrl,
            sharableId,
        });

        return parseStringify(bankAccount);

    }catch(err){
        console.error(err);
    }
}

export const exchangePublicToken = async ({
    publicToken,
    user,
  }: exchangePublicTokenProps) => {
    try {
      // Exchange public token for access token and item ID
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });
  
      const accessToken = response.data.access_token;
      const itemId = response.data.item_id;
      
      // Get account information from Plaid using the access token
      const accountsResponse = await plaidClient.accountsGet({
        access_token: accessToken,
      });
  
      const accountData = accountsResponse.data.accounts[0];
  
      // Create a processor token for Dwolla using the access token and account ID
      const request: ProcessorTokenCreateRequest = {
        access_token: accessToken,
        account_id: accountData.account_id,
        processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
      };
  
      const processorTokenResponse = await plaidClient.processorTokenCreate(request);
      const processorToken = processorTokenResponse.data.processor_token;
  
       // Create a funding source URL for the account using the Dwolla customer ID, processor token, and bank name
       const fundingSourceUrl = await addFundingSource({
        dwollaCustomerId: user.dwollaCustomerId,
        processorToken,
        bankName: accountData.name,
      });
      
      // If the funding source URL is not created, throw an error
      if (!fundingSourceUrl) throw Error;
  
      // Create a bank account using the user ID, item ID, account ID, access token, funding source URL, and shareableId ID
      await createBankAccount({
        userId: user.$id,
        bankId: itemId,
        accountId: accountData.account_id,
        accessToken,
        fundingSourceUrl,
        sharableId: encryptId(accountData.account_id),
      });
  
      // Revalidate the path to reflect the changes
      revalidatePath("/");
  
      // Return a success message
      return parseStringify({
        publicTokenExchange: "complete",
      });
    } catch (error) {
      console.error("An error occurred while creating exchanging token:", error);
    }
  }

export const getBanks = async ({ userId } : getBanksProps) => {
    try{
        const { Database } = await createAdminClient();
        const banks = await Database.listDocuments(DATABASE_ID!, USER_BANK_ID!, [Query.equal('userId', userId)]);
        return parseStringify(banks.documents);
    }catch(err){
        console.error(err);
    }
}

export const getBank = async ({ documentId } : getBankProps) => {
  try{
      const { Database } = await createAdminClient();
      const bank = await Database.listDocuments(DATABASE_ID!, USER_BANK_ID!, [Query.equal('$id', [documentId])]);
      return parseStringify(bank.documents[0]);
  }catch(err){
      console.error(err);
  }
}

export const getBankByAccountId = async ({ accountId }: getBankByAccountIdProps) => {
  try {
    const { Database } = await createAdminClient();

    const bank = await Database.listDocuments(
      DATABASE_ID!,
      USER_BANK_ID!,
      [Query.equal('accountId', [accountId])]
    )

    if(bank.total !== 1) return null;

    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.log(error)
  }
}